import React from 'react';
import verbsFile from './verbs.txt';
import correctSoundFile from './sounds/correct.wav';
import incorrectSoundFile from './sounds/incorrect.wav';

const correctSound = new Audio(correctSoundFile);
const incorrectSound = new Audio(incorrectSoundFile);
const incorrectAnswerRetryInterval = 5;
const correctMessageDisplayTimeSeconds = 2;

const InputBox = (props) => (
  <input id="input" value={props.value} autoComplete="off" autoFocus
    onChange={props.handleChange}
    onKeyPress={props.handleKeyPress}/>
);

const defaultState = {
  languages: null,
  phase: 'loading',
  correctMessages: [],
  incorrectMessages: [],
  tryMessage: null,
  problemQueue: [],
  problems: [],
  currentProblem: null,
  mistakesOnCurrentProblem: 0,
  input: '',
  correctMessage: {
    isCorrect: false,
    message: '',
  },
  correctMessageTimeoutId: null,
  numberOfProblems: 0,
  numberCorrect: 0
};

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = defaultState;

    this.checkAnswer = this.checkAnswer.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.clearCorrectMessage = this.clearCorrectMessage.bind(this);
    this.begin = this.begin.bind(this);
    this.chooseLanguage = this.chooseLanguage.bind(this);
    this.restart = this.restart.bind(this);
  }

  async componentDidMount() {
    const languages = {};
    let info;
    let verbSets;
    let language;
    let correctMessages;
    let incorrectMessages;
    let tryMessage;
    let verb;
    let tenseSets;
    let tense;
    let pronouns;
    let pronounConjugationPairs;
    let conjugations;
    fetch(verbsFile)
      .then(result => result.text())
      .then(text => {

        const languageSets = text.trim().split(/\n\s*\n\s*\n\s*\n/);
        languageSets.forEach(languageSet => {
          [info, ...verbSets] = languageSet.split(/\n\s*\n\s*\n/);
          [language, correctMessages, incorrectMessages, tryMessage] = info.split('\n');
          languages[language] = {
            correctMessages: correctMessages.split(/:\s*/)[1].split('/'),
            incorrectMessages: incorrectMessages.split(/:\s*/)[1].split('/'),
            tryMessage: tryMessage.split(/:\s*/)[1],
            problems: []
          };
          verbSets.forEach(verbSet => {
            [verb, ...tenseSets] = verbSet.split(/\n\s*\n/);
            tenseSets.forEach(tenseSet => {
              [tense, ...pronounConjugationPairs] = tenseSet.split(/\n/);
              pronounConjugationPairs.forEach(pronounConjugationPair => {
                [pronouns, conjugations] = pronounConjugationPair.split(/\s+/);
                pronouns.split('/').forEach(pronoun => {
                  languages[language].problems.push({
                    question: {
                      tense: tense,
                      pronoun: pronoun,
                      verb: verb
                    },
                    answers: conjugations.split('/')
                  });
                });
              });
            });
          });
        });
        this.setState((state) => Object.assign({}, state, {
          phase: 'chooseLanguage',
          languages: languages
        }));
      });
  }

  getRandomProblem(problems = null) {
    problems = problems ?? this.state.problems;
    return Object.assign({}, problems[Math.floor(Math.random() * problems.length)]);
  }

  getRandomCorrectMessage(isCorrect) {
    const messages = isCorrect ? this.state.correctMessages : this.state.incorrectMessages;
    return {
      isCorrect: isCorrect,
      message: messages[Math.floor(Math.random() * messages.length)]
    };
  }

  begin() {
    this.setState((state) => Object.assign({}, state, {
      phase: 'chooseLanguage'
    }));
  }

  restart() {
    this.setState((state) => Object.assign({}, defaultState, {
      phase: 'chooseLanguage',
      languages: this.state.languages,
    }));
  }

  chooseLanguage(language) {
    let problemQueue = [];
    const languageInfo = this.state.languages[language];
    for (let i = 0; i < incorrectAnswerRetryInterval; i++) {
      problemQueue.push(this.getRandomProblem(languageInfo.problems));
    }
    this.setState((state) => Object.assign({}, state, languageInfo, {
      phase: 'play',
      problemQueue: problemQueue,
      currentProblem: this.getRandomProblem(languageInfo.problems)
    }));
  }

  checkAnswer() {
    if (this.state.input === '') {
      return;
    }
    clearTimeout(this.state.correctMessageTimeoutId);
    const correctMessageTimeoutId = setTimeout(this.clearCorrectMessage,
      1000 * correctMessageDisplayTimeSeconds)
    const isCorrect = this.state.currentProblem.answers.includes(this.state.input);

    const newState = Object.assign({}, this.state, {
      numberOfProblems: this.state.numberOfProblems + 1,
      correctMessageTimeoutId: correctMessageTimeoutId
    });

    let newestState;
    if (isCorrect) {
      correctSound.play();
      const [currentProblem, ...problemQueue] = this.state.problemQueue;
      const queuedQuestion = this.state.mistakesOnCurrentProblem ?
        this.state.currentProblem : this.getRandomProblem();
      problemQueue.push(queuedQuestion);
      newestState = {
        currentProblem: currentProblem,
        problemQueue: problemQueue,
        mistakesOnCurrentProblem: false,
        input: '',
        correctMessage: this.getRandomCorrectMessage(true),
        numberCorrect: this.state.numberCorrect + 1
      }
      document.querySelector('input').value = '';
    } else {
      incorrectSound.play();
      const correctMessage = this.state.mistakesOnCurrentProblem >= 2 ? {
        isCorrect: false,
        message: `${this.state.tryMessage} ${this.state.currentProblem.answers.map(answer => `"${answer}"`).join(' ou ')}.`
      } : this.getRandomCorrectMessage(false);
      newestState = {
        mistakesOnCurrentProblem: this.state.mistakesOnCurrentProblem + 1,
        correctMessage: correctMessage
      }
    }
    this.setState((state) => Object.assign({}, newState, newestState));
  }

  clearCorrectMessage() {
    this.setState((state) => Object.assign({}, state, {
      correctMessage: '',
      correctMessageTimeoutId: null
    }));
  }

  updateInput(event) {
    this.setState((state) => Object.assign({}, state, {
      input: event.target.value
    }))
  }

  handleKeyPress(event) {
    if (event.charCode === 13) {
      this.checkAnswer();
    }
  }

  render() {
    let content;
    switch (this.state.phase) {
      case 'loading':
        content = (
          <h1>loading verbs...</h1>
        );
        break;
      case 'chooseLanguage':
        content = (
          <div id="languages">
            {Object.keys(this.state.languages).map(language => (
              <button key={language} className="language-button" onClick={() => this.chooseLanguage(language)}>{language}</button>
            ))}
          </div>
        );
        break;
      case 'play':
        const correctMessageId = this.state.correctMessage.isCorrect ?
          "correct" : "incorrect";
        const accuracy = Math.round(this.state.numberCorrect / this.state.numberOfProblems * 100);
        const score = this.state.numberOfProblems ?
          `${this.state.numberCorrect}/${this.state.numberOfProblems} (${accuracy}%)` : '';
        const question = this.state.currentProblem.question;
        content = (
          <div>
            <div id="container">
              <h2><span className="light-font">{question.tense} {question.pronoun} </span>
                <span className="extra-bold-font">{question.verb}</span></h2>
              <InputBox value={this.props.input}
                handleChange={(event) => this.updateInput(event)}
                handleKeyPress={(event) => this.handleKeyPress(event)}/>
              <h2 className="correct-message" id={correctMessageId}>
                {this.state.correctMessage.message}</h2>
              <h2>{score}</h2>
            </div>
            <button id="restart-button" onClick={this.restart}>Restart</button>
          </div>
        );
        break;
      default:
        break;
    }
    return(
      <div>
        <div>{content}</div>
        <h1 id="conjulameos">Conjulameos</h1>
      </div>
    );
  }
}

export default App;
