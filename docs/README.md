# Living Colors documentation

Living Colors is an ever-growing collection whose mission is to bring every flower to life as an interactive 3D specimen. Start with the [project README](../README.md) for the public API and architecture, then use this index to find implementation guidance, botanical evidence and recorded checks.

## Project references

- [Development and verification](development.md): commands, inspection fixtures, browser scenarios and test procedures. Local development and production use port 1607.
- [Botanical references](botanical-references.md): the collection's source overview, anatomical decisions and authored simplifications.
- [Global flower inventory](FLOWERS.md): generated target inventory and coverage information. Search specific names rather than reading the whole file. An inventory entry does not establish implementation or scientific validation.

## Flower documentation

| Directory                | Purpose                                                                                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [research/](research/)   | One `<flower>.md` dossier per documented flower, recording botanical sources, taxon choices, evidence, uncertainty and authored interpretation.           |
| [specimens/](specimens/) | One `<flower>.md` implementation reference per documented specimen, describing the modeled anatomy, geometry, materials, bloom behavior and known limits. |

Research explains the evidence behind a flower; specimen documentation explains how the app represents it. Read both before changing a species. Neither directory's presence implies that all flowers in the global inventory have been implemented or verified.

## Shared architecture

- [Expanded floral forms](architecture/expanded-forms.md): non-radial surfaces and organs, morph targets, integration and simplifications.
- [Wind and contact](architecture/wind-and-contact.md): anchored deformation, plant attachments, interaction and authored response constants.

## Plans and validation records

[plans/](plans/) contains implementation plans, including dated working plans previously stored under `superpowers/plans/`. These are historical design and execution records; planned work or a checked item alone is not evidence of current behavior.

[validation/](validation/) contains batch and repair records:

Raw measurement and browser verification artifacts live in `validation/data/`; each record links to its associated data. Preserve historical hashes and dates rather than presenting older measurements as current results.

- [Five specimens](validation/five-specimens-validation.md)
- [Next five specimens](validation/next-five-validation.md)
- [Ten specimens](validation/ten-specimens-validation.md)
- [Next ten specimens](validation/next-ten-specimens-validation.md)
- [Floral forms](validation/floral-forms-validation.md)
- [Five floral forms](validation/five-floral-forms-validation.md)
- [Five-flower realism and documentation refinement](validation/five-flower-realism-validation.md)
- [Cymes and spikes](validation/cymes-and-spikes-validation.md)
- [Torenia repair](validation/torenia-repair-validation.md)

Validation records describe the checks, environment and limitations recorded for that change. They do not certify later revisions, every device, measured biological mechanics or scientific identification accuracy. Use [development and verification](development.md) to select and rerun checks for new changes; keep unavailable checks and unmeasured claims explicit.
