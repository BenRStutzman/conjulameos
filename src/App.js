import './App.css';
import React from 'react';
import rawFile from './verbs.txt';

const problems = [];
const incorrectAnswerRetryDistance = 5;

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
              question: `${tense} ${pronoun} ${verb}`,
              answer: conjugation
            });
          });
        });
      });
    });
  });

const InputBox = (props) => (
  <input id="input" value={props.value} autoComplete="off"
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
      const [currentProblem, ...problemQueue] = this.state.problemQueue;
      const queuedQuestion = this.state.hasMissedCurrentProblem ?
        this.state.currentProblem : this.getRandomProblem();
      problemQueue.push(queuedQuestion);
      newestState = {
        currentProblem: currentProblem,
        problemQueue: problemQueue,
        hasMissedCurrentProblem: false,
        input: '',
        correctMessage: 'Correct!',
        numberCorrect: this.state.numberCorrect + 1
      }
      document.querySelector('input').value = '';
    } else {
      newestState = {
        hasMissedCurrentProblem: true,
        correctMessage: 'Incorrect'
      }
    }
    this.setState((state) => Object.assign({}, newState, newestState));
    console.log(this.state.problemQueue);
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
    const heading = this.state.currentProblem ?
      (<h2>{this.state.currentProblem.question}</h2>)
      : (<button onClick={this.begin}>Begin</button>);
    const score = this.state.numberOfProblems ?
      `${this.state.numberCorrect}/${this.state.numberOfProblems}
        (${Math.round(this.state.numberCorrect / this.state.numberOfProblems * 100)}%)`
      : '';
    return (
      <div className="App">
        {heading}
        <InputBox value={this.props.input}
          handleChange={(event) => this.updateInput(event)}
          handleKeyPress={(event) => this.handleKeyPress(event)}/>
        <h1>{this.state.correctMessage}</h1>
        <h2>{score}</h2>
      </div>
    );
  }
}

export default App;
