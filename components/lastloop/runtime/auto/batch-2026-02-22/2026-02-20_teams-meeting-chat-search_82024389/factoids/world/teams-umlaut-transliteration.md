# teams-umlaut-transliteration

## Fact
Teams chat display names use ASCII transliteration for German umlauts, not Unicode characters.

## Evidence
User name: Jürgen Gächter  
Teams display: Gaechter Juergen

## Character mappings
| Umlaut | Transliteration |
|--------|-----------------|
| ä | ae |
| ö | oe |
| ü | ue |
| ß | ss |

## Implication
When searching for users by name in Teams, try both Unicode and ASCII-transliterated variants. The `teams_list_chats` output shows the transliterated form.
