# Task-9-Patterns-Practices-and-Principles
Here task where i had to modify my 7 task with a chat

### Привіт, це нова версія мого чату, де я створив примітивного, як двері бота

#### Щоб користуватися цим ботом, потрібно дотримуватися простих шаблонів, ось декілька прикладів

##### Спитатися погоду, може сказати будь який день неділі, або ж можеш написати today чи tommorow

Приклад:
What is the weather on "Day" in "City" -> What is the weather on Monday in Kyiv
p.s. Може шукати у містах Kyiv, Kharkiv, Odessa, Dnipro, Varash

Його відповідь має бути такою
The weather is Good in Kyiv on Monday, temperature 24 *C

#### Перевести ваші долари чи євро у гривні або навпаки

Приклад:
@bot Convert 'Count' 'Space' 'Currency' to 'CurrencyConvert' -> @bot Convert 20 dollar to euro

Відповідь отримаєте 
20 dollar = 17.07 euro

#### Зробити помітки

@bot Save note title: "Pattern 'Proxy'" body: "JavaScript has new feature Proxy since ES2015"  // Зберегти помітку

##### IMPORTANT Юзайте стандартні лапки (", '), бот може просто вас не зрозуміти і видасть відповідь по типу `Гей друже, я гадаю ти помилився запитом`

@bot Show note "Pattern 'Proxy'"  // Показати помітку з таким заголвком

@bot Show note list // Показати всі помітки що є

@bot Delete note "Pattern 'Proxy'"  // Видалити помітку з таким заловком

#### Задати питання чи попросити цитату

@bot “Що мені робити з домашкою якщо я нічого не розумію? #@)₴?$0   // Приклад питання
Відповідь може бути рандомною, я наприклад отримав:
Старайся! І у тебе все обов'язково вийде.

@bot show quote    // Приклад запиту для отримання цитати
Відповідь також рандом, я наприклад отримав
Если сразу не получилось хорошо, назовите это версией 1.0.
