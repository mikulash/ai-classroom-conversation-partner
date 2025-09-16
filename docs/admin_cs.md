# Administrace

Administrátoři (ADMIN a OWNER) získávají přístup do **Admin sekce**, kde mohou spravovat všechny klíčové entity aplikace.

S právy urovně ADMIN můžete:
- Přidávat, upravovat a mazat **Osobnosti** a ** Scénáře**
- Nastavit používané **modely** (pro odpovědi, TTS a reálný čas) pro sebe (např. vyzkoušení nových modelů)

S právy urovně OWNER navíc můžete:
- Nastavit **globálně používané modely** pro všechny uživatele
- Spravovat **uživatelské profily** (přiřazení rolí ADMIN/USER, sledování konverzací uživatelů)

## Jednotlivé sekce Admin rozhraní

### Osobnosti
V záložce **Osobnosti** můžete:
- **Přidat novou osobnost**  
  Klikněte na tlačítko **Přidat novou osobnost** a vyplňte:
    - Jméno, pohlaví, věk
    - Shrnutí problému (v EN i lokalizaci)
    - URL k vlastnímu avataru (volitelné), avatara lze vytvořit [zde](https://demo.readyplayer.me/avatar/choose) a pak zkopírovat URL do pole.
    - Hlasový profil (např. „verse“, „ballad“, „alloy“ apod.)
- **Upravit** stávající záznam
- **Smazat** nepotřebnou osobnost

>Při tvorbě /editaci je nutné vyplnit co nejpřesněji anglická pole pro shrnutí problému  a popis osobnosti, protože ta se používají jako vstup pro modely. Ceske popisky jsou pouze pro jednoduchost pro uživatele.

---

### Scénáře
V záložce **Scénáře** spravujete předdefinované situace:
- **Přidat nový scénář**
    - Název prostředí (např. „Třída – hodina matematiky“)
    - Detailní popis situace
    - Přiřazení k osobnosti
- **Upravit** nebo **Smazat** existující scénáře
- Scénáře se pak zobrazují uživatelům při volbě před rozmluvou.

> Opět platí, že anglické popisy jsou klíčové pro správnou funkci modelů. Ceske popisky jsou pro uživatele.
---

### Můj výběr AI
Každý administrátor si může nastavovat své **předvolby** modelů, které se použijí misto globálně nastavených modelů:
- **Model pro odpovědi** (např. OpenAI → gpt-4o-mini)
- **Model pro převod textu na řeč (TTS)**
- **Model pro komunikaci v reálném čase (realtime STT+model)**
- **Model pro přepis s časovými značkami** - model který dokáže vracet časové značky pro jednotlivá slova (časově synchronizovane titulky), nutné pro video hovory s avatary
- **Model pro realtime přepis** - pouzivany model pro videohovory, umoznuje plynulejsi komunikaci
- Klikněte **Uložit předvolby** pro potvrzení.

---

---
## S právy OWNER
### Globálně používané modely
Zde jako OWNER určíte **výchozí** modely, které budou platit pro všechny běžné uživatele:
- Stejné kategorie jako v „Můj výběr modelů“
- Změny se projeví okamžitě pro všechny nové i probíhající konverzace
- **Upozornění** informuje o dopadu na systém.

---

### 6.5 Uživatelské profily
V sekci **User profily** spravujete přístupy a role uživatelů:
- Seznam registrovaných e-mailů, jejich jmén­a a aktuální role (Uživatel / Administrátor)
- **Změna role** – vyberte roli z rozbalovacího seznamu
- **Vyhledávání** podle jména či e-mailu
- Datum vytvoření účtu vidíte ve sloupci „Vytvořeno“



