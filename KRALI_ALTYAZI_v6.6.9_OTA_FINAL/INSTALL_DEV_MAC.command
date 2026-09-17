#!/bin/zsh
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
BASE="$HOME/Library/Application Support/Adobe/CEP/extensions"
DEST="$BASE/Krali_Altyazi_DEV"
mkdir -p "$BASE"; rm -rf "$DEST"; ln -s "$HERE" "$DEST"
for V in 9 10 11 12 13 14; do defaults write "com.adobe.CSXS.$V" PlayerDebugMode 1 || true; done
echo ""; echo "KRALİ - ALTYAZI DEV linked:"; echo "$DEST -> $HERE"; echo ""; echo "Premiere'i tamamen kapatıp yeniden aç. Window > Extensions > KRALİ - ALTYAZI"
