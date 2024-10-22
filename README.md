# Cosiam
Sviluppo ERP per conto di Cosiam. Repository privata

## Descrizione struttura repository
Alla radice della seguente repository individueremo:
- Una cartella contenente i **progetti del back-end**, sviluppato in **.NET 5.0**;
- Una cartella contenente il **progetto del front-end**, sviluppato in **Angular 10**;
- Una cartella contenente i **manuali** delle versioni, sotto forma di documenti word, pdf, ecc... (I manuali saranno anche inseriti in allegato al rilascio della rispettiva versione);
- Eventuale documentazione allegata di utilizzo interno (_.gitignore_, _readme.md_);

### Wiki
La documentazione dettagliata del progetto sarà inserità nella sezione Wiki del repository, suddivisa in pagine.
All'interno delle pagine della wiki è possibile utilizzare un linguaggio di Markdown che ci può aiutare a documentare il progetto( https://docs.gitlab.com/ee/user/markdown.html ), infatti è possibile fare riferimento a commits, milestones, issue, ecc... registrati nel progetto

### Rilasci
I rilasci dei compilati delle versioni dell'applicazione saranno caricati nella sezione dei rilasci del progetto con le note di rilascio e i manuali di documentazioni allegati alla versione.

### Milestones
Le _Milestones_ rappresenteranno gli sprint pianificati per lo sviluppo con la relativa scadenza e la dichiarazione delle macro-funzionalità richieste per quella data.
Il **Bug Tracking** sarà gestito attraverso gli "_Issue_".

## Snippets
Possiamo utilizzare la sezione degli _Snippets_ per s**alvare porzioni di codice che possono essere utili in più parti del progetto** o che si vogliono salvare e mettere in evidenza per un riutilizzo futuro nel progetto.

## Note generali per gli sviluppatori
Con il piano gratuito abbiamo a disposizione questa repository privata, con un numero illimitato di collaboratori e **10GB** di occupazione totale di spazio.
Dato il limite di archiviazione **è fondamentale cercare di caricare sul repository solo le cose che vale la pena tracciare**: per esempio non devono essere caricate le dipendenze dei progetti, ma solo i riferimenti a tali dipendenze. Inoltre compilati, file di Log o documenti di test generati da esecuzioni di debug dell'applicazione non devono essere uplodati. Tutto ciò è garantito dal file _.gitignore_ che sarà presente nel repository che non dovrà essere modificato od eliminato a caso.
