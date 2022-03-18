# Vefforritun 2 hópverkefni 1

## Meðlimir hópsins
|   Nafn    |  HÍ-mail |    github username |
|-----------|:---------|-------------------:|
Steinar Logi Geirsson | slg24@hi.is | steinarlogi |
Rögnvaldur Pétur Bjarnason | rpb2@hi.is | RoggoDude |

# Keyra vefþjónustuna

Til þess að keyra upp serverinn í fyrsta skipti þarf að keyra eftirfarandi skipanir.

```bash
npm install
npm run setup
npm run start # eða `npm run dev`
```

# Dæmi um köll
## Fá token til þess að auðkenna
Username: admin
password: 123

Senda POST requestu á /users/login með username=admin og password=123 í body
skilar token til baka. Tokeninn er notaður sem Bearer token í authorization headernum til þess að senda
requestur á endapunkta sem krefjast auðkenningar.

## Endapunktar sem krefjast þess ekki að notandi sé auðkenndur
GET á /menu skilar öllum vörum á matseðli

GET á /categories skilar öllum flokkum

GET á menu/:{id} skilar vöru með id {id} af matseðli

GET á /menu?search=pizza Skilar öllum vörum sem innihalda orðið pizza í description eða title.

GET á /menu?category=2 Skilar öllum vörum sem tilheyra flokki með id 2.

## Endapunktar sem krefjast þess að notandi sé auðkenndur
Til þess að búa til nýja vöru á matseðli þarf að senda POST requestu á /menu. Gögnin í body þarf að senda sem multipart/form-data. Body þarf að innihalda title(strengur), description(strengur), category(heiltala), price(heiltala) og picture(image/jpeg eða image/png). Myndin er vistuð á clodunary og hlekkur að myndinni geymdur í gagnagrunni.

DELETE á /menu/{id} eyðir gögnum um vöru á matseðli með id = {id}

DELETE á /categories{id} eyðir gögnum um vöru á matseðli með id={id}