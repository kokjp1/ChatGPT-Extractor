# ChatGPT HTML to JSON Converter 

Als je een ChatGPT-gesprek downloadt via "Save Page As...", krijg je een gigantisch HTML-bestand vol met onleesbare code en geneste divs. 

Deze tool filtert alle ruis weg en zet je chat om in een schone, gestructureerde JSON die direct gebruikt kan worden door andere AI-modellen (zoals Claude, Gemini, Llama) als context of voor fine-tuning.

## Wat het doet
- Leest lokaal opgeslagen `.htm` of `.html` bestanden.
- Herkent automatisch of een bericht van de `user` of `assistant` is.
- Verwijdert alle HTML-opmaak en behoudt alinea's.
- Exporteert een schone `[bestandsnaam].json` in dezelfde map.

## Vereisten
Dit script gebruikt `BeautifulSoup` om de HTML te parsen. Je hebt alleen Python nodig en één library:
`pip install beautifulsoup4`

## Hoe te gebruiken
Start het script, klik op de knop, selecteer je HTML-bestand en de JSON wordt direct voor je gegenereerd!
