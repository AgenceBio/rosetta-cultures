# rosetta-cultures

Traduction des codes CPF en code PAC — et vice-versa — en code JavaScript.

## Installer

```sh
npm install @agencebio/rosetta-cultures
```

L'installation déclenche automatiquement la construction du fichier [`cpf.json`](#comment-mettre-à-jour-la-correspondance)

## Comment mettre à jour les fichiers CSV ?

### [`data/nomenclature.csv`](data/nomenclature.csv)

Sur [Nomenclature produits CPFBIO][nomenclature-cpf] :
1. naviguer dans l'onglet `CPFBIO`
2. `Fichier` ↦ `Télécharger` ↦ `CSV`
3. renommer et remplacer le fichier téléchargé

### [`data/correspondance.csv`](data/correspondance.csv)

Sur [Nomenclature produits CPFBIO][nomenclature-cpf] :
1. naviguer dans l'onglet `PAC`
2. `Fichier` ↦ `Télécharger` ↦ `CSV`
3. renommer et remplacer le fichier téléchargé

### [`data/correspondance-bureau-veritas.csv`](data/correspondance-bureau-veritas.csv)

Sur [Nomenclature BV][correspondance-bv] :
1. naviguer dans l'onglet `PAC`
2. `Fichier` ↦ `Télécharger` ↦ `CSV`
3. renommer et remplacer le fichier téléchargé

### [`data/cepages.csv`](data/cepages.cssv)

En utilisant le logiciel [csvkit](https://csvkit.readthedocs.io/).

```sh
in2csv --skip-lines 2 /path/to/ListeCepage_20-12-20xx.xls > ./data/cepages.csv
```

## Comment mettre à jour la correspondance ?

Le fichier [`data/cpf.json`](data/cpf.json) contient le recoupement des fichiers CSV. Il se met à jour avec la commande suivante :

```sh
npm run build
```

## Comment mettre en ligne une nouvelle version ?

Le module npm est [publié automatiquement][action] dès qu'un nouveau tag Git est publié.

```sh
npm version minor
git push --all
```

[nomenclature-cpf]: https://docs.google.com/spreadsheets/d/1q_AS0MNpAXBWrZX_bbKJ6-5oP2wi5N6o/edit
[correspondance-bv]: https://docs.google.com/spreadsheets/d/1xP3OTG_1MTWl6zEfgi080_xB3l8UyVnC/edit
[action]: .github/workflows/npm-publish.yml
