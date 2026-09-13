"""Coverage boundaries and failure handling for the global taxonomy importer."""
import io
import unittest
import zipfile
from scripts.flower_inventory import Taxon, classify, generate, read_taxa


def fixture():
    return {
        "plant": Taxon("plant", "", "plant", "Plantae", "kingdom"),
        "flower": Taxon("flower", "plant", "flower", "Angiosperms", "clade"),
        "family": Taxon("family", "flower", "family", "Rosaceae", "family"),
        "genus": Taxon("genus", "family", "genus", "Rosa", "genus"),
        "rose": Taxon("rose", "genus", "rose", "Rosa canina", "species"),
        "variety": Taxon("variety", "rose", "variety", "Rosa canina var. test", "variety"),
        "conifer": Taxon("conifer", "plant", "conifer", "Pinus test", "species"),
    }


SOURCE = {"title": "Fixture", "record": "https://example.org", "doi": "fixture",
          "license": "CC0-1.0", "angiospermRoot": "flower"}


class InventoryTests(unittest.TestCase):
    def test_ancestry_includes_infraspecific_taxa_but_excludes_conifers_and_higher_ranks(self):
        taxa = fixture()
        # Order of archive rows must not change classification or output.
        lineage = classify(dict(reversed(list(taxa.items()))), "flower")
        document, audit = generate(taxa, lineage, [], SOURCE)
        self.assertEqual(audit["inventoryTaxa"], 2)
        self.assertEqual(audit["ranks"], {"species": 1, "variety": 1})
        self.assertIn("- Rosa canina — `rose`", document)
        self.assertIn("- Rosa canina var. test — `variety`", document)
        self.assertNotIn("- Pinus test", document)
        self.assertNotIn("- Rosa —", document)
        self.assertEqual(lineage["variety"].family, "Rosaceae")

    def test_missing_parents_cycles_and_wrong_root_fail_instead_of_dropping_taxa(self):
        for replacement in [
            Taxon("rose", "absent", "rose", "Rosa canina", "species"),
            Taxon("rose", "variety", "rose", "Rosa canina", "species"),
        ]:
            taxa = fixture()
            taxa["rose"] = replacement
            with self.assertRaises(ValueError):
                classify(taxa, "flower")
        with self.assertRaises(ValueError):
            classify(fixture(), "plant")

    def test_only_the_explicit_code_boundary_above_plantae_is_permitted(self):
        taxa = fixture()
        taxa["plant"] = Taxon("plant", "code", "plant", "Plantae", "kingdom")
        self.assertTrue(classify(taxa, "flower", {"code": "plant"})["rose"].flowering)
        with self.assertRaises(ValueError):
            classify(taxa, "flower")
        taxa["rose"] = Taxon("rose", "code", "rose", "Rosa canina", "species")
        with self.assertRaises(ValueError):
            classify(taxa, "flower", {"code": "plant"})

    def test_unplaced_family_is_retained_and_extinction_flag_survives(self):
        taxa = fixture()
        taxa["orphan"] = Taxon("orphan", "flower", "orphan", "Unknownia test", "species", True)
        document, audit = generate(taxa, classify(taxa, "flower"), [], SOURCE)
        self.assertEqual(audit["inventoryTaxa"], 3)
        self.assertIn("### Unplaced flowering plants", document)
        self.assertIn("- Unknownia test — `orphan` · source flags extinct", document)

    def test_study_matching_does_not_claim_unrelated_species_or_exact_physics(self):
        catalog = [{"slug": "rose", "name": "Rose", "scientificName": "Rosa canina"},
                   {"slug": "garden-rose", "name": "Garden rose", "scientificName": "Rosa × hybrida"}]
        taxa = fixture()
        document, audit = generate(taxa, classify(taxa, "flower"), catalog, SOURCE)
        self.assertEqual(audit["matchedAuthoredStudies"], 1)
        self.assertFalse(audit["exactBiologicalSimulationVerified"])
        self.assertIn("Taxonomic mapping requires review", document)
        self.assertIn("authored study: `rose`", document)
        self.assertNotIn("`variety` · variety · authored study", document)

    def test_archive_joins_by_name_id_and_rejects_missing_or_duplicate_records(self):
        def archive(taxon_rows, name_rows):
            stream = io.BytesIO()
            with zipfile.ZipFile(stream, "w") as zipped:
                zipped.writestr("taxon.tsv", "ID\tparentID\tnameID\textinct\n" + taxon_rows)
                zipped.writestr("name.tsv", "ID\tscientificName\trank\n" + name_rows)
            return zipfile.ZipFile(stream)
        with archive("t1\t\tn1\tfalse\n", "n1\tRosa canina\tspecies\n") as zipped:
            self.assertEqual(read_taxa(zipped)["t1"].name, "Rosa canina")
        for taxon_rows, name_rows in [
            ("t1\t\tn1\tfalse\n", ""),
            ("t1\t\tn1\tfalse\nt1\t\tn1\tfalse\n", "n1\tRosa canina\tspecies\n"),
            ("t1\t\tn1\tfalse\n", "n1\tRosa canina\tspecies\nn1\tRosa canina\tspecies\n"),
        ]:
            with archive(taxon_rows, name_rows) as zipped:
                with self.assertRaises(ValueError):
                    read_taxa(zipped)


if __name__ == "__main__":
    unittest.main()
