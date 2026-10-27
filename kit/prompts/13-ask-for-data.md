# Video 13 · Ask for data the right way

**P13.1 · The five parts of a data prompt.**

```text
Using the UN Data Commons tools:
WHAT   [the measure, in plain words]
WHERE  [places by name, or a UN region or group]
WHEN   [latest | every year since 2015 | 2015 and the latest]
PROOF  give the year and source of every value, list places with no data,
       and say which series you used and why
FORMAT one table: [columns]
```

**P13.2 · One number, read properly.**

```text
Using the UN Data Commons tools: the latest share of women aged 20–24 in Mali who were
married before 18. Give the value, year, unit, source and the series id you used.
```

**P13.3 · Which indicator?**

```text
Before fetching anything: which indicators in the UN Data Commons measure child
marriage? For each, who publishes it, what exactly it measures, and how many years it
covers. Recommend one for SDG reporting and say why.
```

**P13.4 · Which Sahel?**

```text
By "the Sahel" I mean the 10 UNISS countries: Burkina Faso, Cameroon, Chad, Gambia,
Guinea, Mali, Mauritania, Niger, Nigeria, Senegal.
```

**P13.5 · Ten countries, one table.**

```text
For those 10 countries, get the latest value of SDG 5.3.1 (women 20–24 married before
18). One table: country | year | value | source. List any country with no data. Then
give me the table as a CSV file.
```

**P13.6 · The history.**

```text
Now every year available for Mali. If your series has only one year, look for another
UN series with history and tell me which agency publishes it.
```

**P13.7 · A continent in one call.**

```text
Use get_child_observations for child marriage across every country in Africa, latest
values. Tell me the oldest and newest year in the result, and how many countries have a
value from before 2015.
```

**P13.8 · Breakdowns.**

```text
Which breakdowns exist for lower-secondary completion (SDG 4.1.2)? Then get girls and
boys for the 10 countries, in the same year for both.
```

**P13.9 · In your language.**

```text
Avec les outils UN Data Commons : quel est le dernier taux d'achèvement du premier
cycle du secondaire pour les filles au Niger ? Donne l'année et la source.
```

**P13.10 · Prompts that go wrong, and how to fix them.**

| Instead of | Ask |
|---|---|
| Education in the Sahel | Lower-secondary completion rate for girls (SDG 4.1.2), latest, for [list of countries] |
| What is the current rate? | What is the latest value, and from which year? |
| Health and education spending in Mali | Two questions, one concept each |
| Data for West Africa | Data for the 17 countries and areas of the UN M49 sub-region "Western Africa" |

**P13.11 · The table contract.** Ask for this whenever you will reuse the data.

```text
Give me the result in this layout: country | iso3 | indicator | sdg | series_id | year |
value | unit | source | note. One row per value. Never leave out a country: a country
with no data gets a row with an empty value and "no data" in note.
```
