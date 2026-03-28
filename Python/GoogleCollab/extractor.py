from bs4 import BeautifulSoup
import json
from google.colab import files

def converteer_chatgpt_naar_json(bestand_pad, output_pad='schone_chat.json'):
    with open(bestand_pad, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
    
    messages = []
    
    for bericht_div in soup.find_all('div', attrs={"data-message-author-role": True}):
        rol = bericht_div['data-message-author-role']
        
        if rol == "user":
            content_div = bericht_div.find('div', class_='whitespace-pre-wrap')
        else:
            content_div = bericht_div.find('div', class_='markdown')
            
        if content_div:
            tekst = content_div.get_text(separator="\n").strip()
            messages.append({
                "role": rol, 
                "content": tekst
            })
            
    with open(output_pad, 'w', encoding='utf-8') as f:
        json.dump(messages, f, indent=4, ensure_ascii=False)
        
    print(f"Klaar! {len(messages)} berichten succesvol omgezet.")
    
    print("Download wordt nu gestart...")
    files.download(output_pad)

converteer_chatgpt_naar_json('/Personal - Branch · Trias Politicas Journay - extraplatonic.htm')