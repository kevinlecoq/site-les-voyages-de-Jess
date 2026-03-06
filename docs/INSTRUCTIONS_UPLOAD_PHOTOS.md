# 📸 INSTRUCTIONS : Upload des photos

## ÉTAPE 1 : Télécharger depuis WeTransfer

1. Ouvrez le lien dans votre navigateur : https://we.tl/t-F55sBfhOOF
2. Cliquez sur le bouton bleu "Download"
3. Le fichier `nouvelles-photos.zip` se télécharge dans votre dossier "Téléchargements"

## ÉTAPE 2 : Décompresser le ZIP

```bash
cd ~/Downloads
unzip nouvelles-photos.zip -d ~/Desktop/photos-extraites
```

## ÉTAPE 3 : Copier dans le projet

```bash
cd ~/Desktop/"site internet perso"/les-voyages-de-jess
cp ~/Desktop/photos-extraites/*.jpg temp-nouvelles-photos/
```

## ÉTAPE 4 : Commit + Push

```bash
git add temp-nouvelles-photos/
git commit -m "temp: Ajout nouvelles photos hero"
git push origin fix/responsive-optimisations
```

## ÉTAPE 5 : Me prévenir

Dites-moi : "Les photos sont pushées sur Git !"
