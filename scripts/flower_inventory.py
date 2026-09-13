"""Generate the global flower inventory from a checksum-pinned WFO ColDP release.

Python standard library only. The archive remains outside the application bundle.
Never infer acceptance from a name string: taxon.tsv supplies accepted usages.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import html
import io
import json
import re
import urllib.request
import zipfile
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


@dataclass(frozen=True)
class Taxon:
    id: str
    parent: str
    name_id: str
    name: str
    rank: str
    extinct: bool = False


@dataclass(frozen=True)
class Lineage:
    flowering: bool
    family: str
    species_level: bool


def classify(taxa: dict[str, Taxon], root: str, external_roots: dict[str, str] | None = None) -> dict[str, Lineage]:
    """Follow complete parent chains; reject missing parents and cycles."""
    if root not in taxa or taxa[root].name != "Angiosperms":
        raise ValueError("Pinned Angiosperms root is missing or renamed")
    result: dict[str, Lineage] = {}
    for parent, child in (external_roots or {}).items():
        children = {node.id for node in taxa.values() if node.parent == parent}
        if parent in taxa or children != {child} or taxa[child].rank != "kingdom" or taxa[child].name != "Plantae":
            raise ValueError(f"Unexpected external nomenclatural boundary: {parent}")
        result[parent] = Lineage(False, "", False)
    for identity in taxa:
        chain: list[str] = []
        visited: set[str] = set()
        cursor = identity
        while cursor and cursor not in result:
            if cursor in visited:
                raise ValueError(f"Taxonomic cycle at {cursor}")
            if cursor not in taxa:
                raise ValueError(f"Missing parent {cursor} for {identity}")
            visited.add(cursor)
            chain.append(cursor)
            cursor = taxa[cursor].parent
        lineage = result[cursor] if cursor else Lineage(False, "", False)
        for item in reversed(chain):
            node = taxa[item]
            lineage = Lineage(
                lineage.flowering or item == root,
                node.name if node.rank == "family" else lineage.family,
                lineage.species_level or node.rank == "species",
            )
            result[item] = lineage
    return result


def digest(path: Path, algorithm: str) -> str:
    hasher = hashlib.new(algorithm)
    with path.open("rb") as stream:
        while block := stream.read(1024 * 1024):
            hasher.update(block)
    return hasher.hexdigest()


def ensure_archive(source: dict, check: bool) -> Path:
    target = ROOT / "dist/taxonomy" / source["archive"]
    if not target.exists():
        if check:
            raise ValueError("Archive unavailable; run npm run flowers:inventory first")
        target.parent.mkdir(parents=True, exist_ok=True)
        partial = target.with_suffix(".zip.partial")
        print(f"Downloading {source['title']} ({source['bytes']:,} bytes)", flush=True)
        with urllib.request.urlopen(source["url"], timeout=60) as response, partial.open("wb") as output:
            size = 0
            while block := response.read(1024 * 1024):
                output.write(block)
                size += len(block)
                if size % (16 * 1024 * 1024) == 0:
                    print(f"Downloaded {size:,} bytes", flush=True)
        if partial.stat().st_size != source["bytes"] or digest(partial, "md5") != source["md5"]:
            raise ValueError("Downloaded archive does not match the pinned publisher checksum")
        partial.replace(target)
    if target.stat().st_size != source["bytes"] or digest(target, "md5") != source["md5"]:
        raise ValueError(f"Unverified archive at {target}; no documentation was changed")
    return target


def rows(archive: zipfile.ZipFile, filename: str, required: set[str]):
    with archive.open(filename) as binary:
        with io.TextIOWrapper(binary, encoding="utf-8-sig", newline="") as text:
            reader = csv.DictReader(text, delimiter="\t")
            if not required.issubset(reader.fieldnames or []):
                raise ValueError(f"Unexpected {filename} schema")
            for row in reader:
                if None in row:
                    raise ValueError(f"Malformed {filename} row at line {reader.line_num}")
                yield row


def read_taxa(archive: zipfile.ZipFile) -> dict[str, Taxon]:
    usages: dict[str, dict] = {}
    for row in rows(archive, "taxon.tsv", {"ID", "parentID", "nameID", "extinct"}):
        if row["ID"] in usages:
            raise ValueError(f"Duplicate accepted taxon ID: {row['ID']}")
        usages[row["ID"]] = {key: row[key] for key in ["ID", "parentID", "nameID", "extinct"]}
    wanted = {row["nameID"] for row in usages.values()}
    names: dict[str, tuple[str, str]] = {}
    for row in rows(archive, "name.tsv", {"ID", "scientificName", "rank"}):
        if row["ID"] in wanted:
            if row["ID"] in names:
                raise ValueError(f"Duplicate name ID: {row['ID']}")
            names[row["ID"]] = (row["scientificName"], row["rank"])
    missing = wanted - names.keys()
    if missing:
        raise ValueError(f"Missing names for accepted usages: {sorted(missing)[:5]}")
    return {identity: Taxon(identity, row["parentID"], row["nameID"],
                            *names[row["nameID"]], row["extinct"] == "true")
            for identity, row in usages.items()}


def normalized(name: str) -> str:
    return " ".join(name.replace("×", " × ").split()).casefold()


def escape(text: str) -> str:
    return html.escape(text, quote=False).replace("|", "\\|").replace("\n", " ")


def generate(taxa: dict[str, Taxon], lineage: dict[str, Lineage], catalog: list[dict], source: dict):
    plants = [node for node in taxa.values() if lineage[node.id].flowering and lineage[node.id].species_level]
    families: dict[str, list[Taxon]] = defaultdict(list)
    name_index: dict[str, list[Taxon]] = defaultdict(list)
    for node in plants:
        families[lineage[node.id].family or "Unplaced flowering plants"].append(node)
        name_index[normalized(node.name)].append(node)
    rank_counts = Counter(node.rank for node in plants)
    matches: dict[str, str] = {}
    current: list[str] = []
    for specimen in catalog:
        found = name_index.get(normalized(specimen["scientificName"]), [])
        exact = found[0] if len(found) == 1 else None
        if exact:
            matches[exact.id] = specimen["slug"]
        status = f"Exact accepted-name match: `{exact.id}`" if exact else "Taxonomic mapping requires review"
        current.append(f"| [{escape(specimen['name'])}](http://localhost:1607/flower/{specimen['slug']}/) | {escape(specimen['scientificName'])} | {status} |")
    species = rank_counts.get("species", 0)
    lines = [
        "# FLOWERS · Project LC global inventory", "",
        "Project LC's mission is to create every flower as a realistic interactive specimen. This inventory supports that ongoing work; it does not claim the mission is complete.", "",
        f"Source: [{source['title']}]({source['record']}), DOI `{source['doi']}`, licensed {source['license']}. This is a pinned taxonomic snapshot, not a live or final census of the world's flowers.", "",
        f"This file enumerates **{species:,} accepted flowering-plant species** and **{len(plants)-species:,} accepted taxa below species**, grouped by {len(families):,} family headings. Inclusion follows the complete parent chain beneath WFO's `Angiosperms` taxon `{source['angiospermRoot']}`. Grasses, sedges, trees and inconspicuous flowers are included.", "",
        "## Status and scope", "",
        "Every entry below is an inventory target. An `authored study` annotation means a current LC specimen has an exact, unambiguous scientific-name match; it does **not** establish accurate anatomy, calibrated physics, full cultivar coverage or scientific validation. Entries without that annotation have no matched implemented specimen.", "",
        "Synonyms are alternative names, not additional accepted species, and are not duplicated here. Unplaced/unresolved names outside the accepted classification, unrecorded species and horticultural cultivars absent from this release remain coverage gaps. Existing ornamental or hybrid concepts with no exact match stay explicitly unmapped. Exact string matching is a review aid, not a taxonomic identification claim.", "",
        "The full objective still requires species-specific organ geometry, pigments, pollen, foliage, stems, opening motion and validated physical behavior. Current models use authored dynamics; none is certified here as an exact biological simulation. Anatomical references alone cannot supply measured elastic properties, damping or drag coefficients.", "",
        "## Current interactive studies", "",
        "Generated from `lib/flowers/catalog.ts`; genus or ornamental studies never mark all related species implemented.", "",
        "| Study | Catalog scientific name | Taxonomic mapping |", "| --- | --- | --- |",
        *current, "",
        "## Reproduce and audit", "",
        "Run `npm run flowers:inventory` to export the current app catalog and regenerate this document. The importer uses Python 3.10+ and the standard library, verifies the publisher's archive size/MD5, validates every parent chain, and writes a SHA-256 provenance manifest at `data/taxonomy/inventory.json`. The downloaded archive stays in ignored `dist/taxonomy/` and is never bundled into the app.", "",
        "Run `npm run flowers:check` to rebuild in memory and compare the inventory and manifest against the same verified archive and current catalog. `npm run test:taxonomy` exercises classification failures and coverage boundaries with small fixtures. Do not hand-edit generated entries. Update the pinned source deliberately when a newer release is reviewed.", "",
        "This large file contains the complete selected snapshot for local search. Search a binomial or WFO ID with `rg`; WFO IDs resolve at `https://list.worldfloraonline.org/<ID>`. The family index provides section links. The application does not import this document.", "",
        "## Family index", "", "| Family | Inventory taxa |", "| --- | ---: |",
    ]
    for family in sorted(families):
        anchor = re.sub(r"[^a-z0-9 -]", "", family.lower()).replace(" ", "-")
        lines.append(f"| [{escape(family)}](#{anchor}) | {len(families[family]):,} |")
    lines += ["", "## Complete accepted flowering-plant inventory", ""]
    for family in sorted(families):
        lines += [f"### {escape(family)}", ""]
        for node in sorted(families[family], key=lambda n: (normalized(n.name), n.id)):
            label = "" if node.rank == "species" else f" · {escape(node.rank)}"
            label += " · source flags extinct" if node.extinct else ""
            label += f" · authored study: `{matches[node.id]}`" if node.id in matches else ""
            lines.append(f"- {escape(node.name)} — `{node.id}`{label}")
        lines.append("")
    document = "\n".join(lines)
    audit = {
        "source": source,
        "acceptedTaxaInArchive": len(taxa),
        "inventoryTaxa": len(plants),
        "ranks": dict(sorted(rank_counts.items())),
        "familyHeadings": len(families),
        "matchedAuthoredStudies": len(matches),
        "catalogStudies": len(catalog),
        "exactBiologicalSimulationVerified": False,
        "documentSha256": hashlib.sha256(document.encode("utf-8")).hexdigest(),
        "catalogSha256": hashlib.sha256(json.dumps(catalog, sort_keys=True, ensure_ascii=False).encode("utf-8")).hexdigest(),
    }
    return document, audit


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    source = json.loads((ROOT / "data/taxonomy/source.json").read_text(encoding="utf-8"))
    archive = ensure_archive(source, args.check)
    catalog = json.loads((ROOT / "dist/taxonomy/catalog.json").read_text(encoding="utf-8"))
    with zipfile.ZipFile(archive) as zipped:
        taxa = read_taxa(zipped)
    lineage = classify(taxa, source["angiospermRoot"], source.get("externalRoots"))
    document, audit = generate(taxa, lineage, catalog, source)
    audit["archiveSha256"] = digest(archive, "sha256")
    outputs = {
        ROOT / "docs/FLOWERS.md": document,
        ROOT / "data/taxonomy/inventory.json": json.dumps(audit, indent=2, ensure_ascii=False) + "\n",
    }
    for path, content in outputs.items():
        if args.check:
            if not path.exists() or path.read_text(encoding="utf-8") != content:
                raise ValueError(f"Stale generated inventory: {path}")
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            temporary = path.with_suffix(path.suffix + ".tmp")
            temporary.write_text(content, encoding="utf-8", newline="\n")
            temporary.replace(path)
    print(json.dumps({key: audit[key] for key in ["inventoryTaxa", "ranks", "familyHeadings", "matchedAuthoredStudies"]}))


if __name__ == "__main__":
    main()
