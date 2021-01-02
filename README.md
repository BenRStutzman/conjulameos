# Conjulameos
Welcome to *ConjuLAMEos* - a lame version of [conjuguemos.com](https://www.conjuguemos.com/verb/homework/100) for practicing verb conjugations, but customizable with whatever verbs you want!
<br><br>
![gameplay](https://raw.githubusercontent.com/BenRStutzman/conjulameos/master/pictures/gameplay.png)
<br><br>
![verbsheet](https://raw.githubusercontent.com/BenRStutzman/conjulameos/master/pictures/verbsheet.png)
<br>
## Running the program
In the command prompt, navigate into the `conjulameos` folder. To run the program in development, run `npm start`. To run the program for production, run `npm run build` and then `serve build`. (You must first have npm and install `serve` with `npm install -g serve` if you haven't already.) You will then be directed to go to an address such as http://localhost:5000 in a browser.

## Playing the game
Click the "Yalla" button to begin. The game will prompt you with a verb tense (e.g. "presente"), a pronoun (e.g. "ela"), and a verb in the infinitive form (e.g. "querer"). Conjugate the verb according to the pronoun and tense and type your answer in the input box, then press enter to see if you're right. Repeat ad infinitum!

## Adding verbs
To add verbs, edit `src/verbs.txt` and then re-build the program with `npm run build`. Just follow the spacing pattern of the existing verbs, or use these instructions if you want them spelled out:
1. Separate each language section (e.g. all the Portuguese words) with three blank lines.
2. The first four lines of each language section should contain:
    1. The name of the language
    2. The options for messages to display when the player answers correctly.
    3. The options for messages to display when the player answers incorrectly.
    4. The word for "try" in that language, to be used when the player answers incorrectly three times in a row and gets prompted with the correct answer
    - For example, the first four lines of the Portuguese section could be:
    > Portuguese<br>
    > correct: Correto!/Ótimo!/Fixe!<br>
    > incorrect: Incorreto./Opa./Não.<br>
    > try: Tente
3. Include three blank lines after the header information for each language section
4. Within each language section, separate each verb section (e.g. all the conjugations of 'querer')
   with two blank lines.
5. Within each verb section, separate each tense section (e.g. all the
   conjugations in the present tense) with one blank line.
6. Within each tense section, put the tense name first (e.g. 'presente') on its
   own line, and the pronoun/conjugation pairs on the following lines.
7. Within each pronoun/conjugation pair, separate the pronoun and the
   conjugation with a space (e.g. 'eu quero').
8. For conjugations that work for multiple pronouns, separate each pronoun
   with a forward slash (e.g. 'ele/ela/você quer').
9. For conjugations with multiple correct answers, separate each conjugation
   with a forward slash (e.g. 'tu diz/dize').
10. For conjugations that apply to all pronouns, include at least one space
   before the conjugation (e.g. '  querido' for particípio).

## Sound sources
- Correct: https://freesound.org/people/StavSounds/sounds/546082/
- Incorrect: https://freesound.org/people/Bertrof/sounds/131657/
