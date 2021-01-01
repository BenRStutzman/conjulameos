import React from 'react';
import rawFile from './verbs.txt';
import correctSoundFile from './sounds/correct.wav';
import incorrectSoundFile from './sounds/incorrect.wav';

const correctSound = new Audio(correctSoundFile);
const incorrectSound = new Audio(incorrectSoundFile);

const problems = [];
const incorrectAnswerRetryDistance = 5;
const correctMessageCorrect = "Correct!";
const correctMessageIncorrect = "Incorrect.";

fetch(rawFile)
  .then(result => result.text())
  .then(text => {
    let verb;
    let tenseSets;
    let tense;
    let pronouns;
    let pronounConjugationPairs;
    let conjugation;
    const verbSets = text.trim().split(/\n\s*\n\s*\n/).slice(1,)
    verbSets.forEach(verbSet => {
      [verb, ...tenseSets] = verbSet.split(/\n\s*\n/);
      tenseSets.forEach(tenseSet => {
        [tense, ...pronounConjugationPairs] = tenseSet.split(/\n/);
        pronounConjugationPairs.forEach(pronounConjugationPair => {
          [pronouns, conjugation] = pronounConjugationPair.split(/\s+/);
          pronouns.split('/').forEach(pronoun => {
            problems.push({
              question: {
                tense: tense,
                pronoun: pronoun,
                verb: verb
              },
              answer: conjugation
            });
          });
        });
      });
    });
  });

const InputBox = (props) => (
  <input id="input" value={props.value} autoComplete="off" autoFocus
    onChange={props.handleChange}
    onKeyPress={props.handleKeyPress}/>
);

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      problemQueue: [],
      currentProblem: null,
      hasMissedCurrentProblem: false,
      input: '',
      correctMessage: '',
      correctMessageTimeoutId: null,
      numberOfProblems: 0,
      numberCorrect: 0
    };

    this.checkAnswer = this.checkAnswer.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.clearCorrectMessage = this.clearCorrectMessage.bind(this);
    this.begin = this.begin.bind(this);
  }

  getRandomProblem() {
    return Object.assign({}, problems[Math.floor(Math.random() * problems.length)]);
  }

  begin() {
    let problemQueue = []
    for (let i = 0; i < incorrectAnswerRetryDistance; i++) {
      problemQueue.push(this.getRandomProblem());
    }
    this.setState((state) => Object.assign({}, state, {
      problemQueue: problemQueue,
      currentProblem: this.getRandomProblem()
    }));
  }

  checkAnswer() {
    clearTimeout(this.state.correctMessageTimeoutId);
    const correctMessageTimeoutId = setTimeout(this.clearCorrectMessage, 1000)
    const isCorrect = this.state.input === this.state.currentProblem.answer;

    const newState = Object.assign({}, this.state, {
      numberOfProblems: this.state.numberOfProblems + 1,
      correctMessageTimeoutId: correctMessageTimeoutId
    });

    let newestState;
    if (isCorrect) {
      correctSound.play();
      const [currentProblem, ...problemQueue] = this.state.problemQueue;
      const queuedQuestion = this.state.hasMissedCurrentProblem ?
        this.state.currentProblem : this.getRandomProblem();
      problemQueue.push(queuedQuestion);
      newestState = {
        currentProblem: currentProblem,
        problemQueue: problemQueue,
        hasMissedCurrentProblem: false,
        input: '',
        correctMessage: correctMessageCorrect,
        numberCorrect: this.state.numberCorrect + 1
      }
      document.querySelector('input').value = '';
    } else {
      incorrectSound.play();
      newestState = {
        hasMissedCurrentProblem: true,
        correctMessage: correctMessageIncorrect
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
    if (this.state.currentProblem) {
      const correctMessageId = this.state.correctMessage === correctMessageCorrect ?
        "correct" : "incorrect";
      const accuracy = Math.round(this.state.numberCorrect / this.state.numberOfProblems * 100);
      const score = this.state.numberOfProblems ?
        `${this.state.numberCorrect}/${this.state.numberOfProblems} (${accuracy}%)` : '';
      const question = this.state.currentProblem.question;
      content = (
        <div id="container">
          <div id="heading">
            <h2><span className="light-font">{question.tense} {question.pronoun} </span>
              <span className="extra-bold-font">{question.verb}</span></h2>
          </div>
          <InputBox value={this.props.input}
            handleChange={(event) => this.updateInput(event)}
            handleKeyPress={(event) => this.handleKeyPress(event)}/>
          <h2 className="correct-message" id={correctMessageId}>{this.state.correctMessage}</h2>
          <h2>{score}</h2>
        </div>
      );
    } else {
      content = (
        <div>
          <button id="begin" onClick={this.begin} autoFocus>Yalla!</button>
        </div>
      );
    }
    return(
      <div>
        <h1 id="conjulameos">Conjulameos</h1>
        {content}
      </div>
    );
  }
}

export default App;
