import './App.css';
import React from 'react';

const questions = [
  {
    question: 'presente ele querer',
    answer: 'quer'
  },
  {
    question: 'conjuntivo imperfeito ele querer',
    answer: 'quisesse'
  },
  {
    question: 'presente tu dizer',
    answer: 'dizes'
  }
];

const InputBox = (props) => (
  <input id="input" value={props.value} autocomplete="off"
    onChange={props.handleChange}
    onKeyPress={props.handleKeyPress}/>
);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentProblem: this.getRandomProblem(),
      input: '',
      correctMessage: '',
      correctMessageTimeoutId: null,
    };
    this.checkAnswer = this.checkAnswer.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.clearCorrectMessage = this.clearCorrectMessage.bind(this);
  }

  getRandomProblem() {
    return questions[Math.floor(Math.random() * questions.length)];
  }

  checkAnswer() {
    console.log(this.state.correctMessageTimeoutId);
    clearTimeout(this.state.correctMessageTimeoutId);
    const correctMessageTimeoutId = setTimeout(this.clearCorrectMessage, 1000)
    const isCorrect = this.state.input === this.state.currentProblem.answer;
    let correctMessage;
    switch (isCorrect) {
      case true:
        correctMessage = 'Correct!'
        break;
      case false:
        correctMessage = 'Incorrect.'
        break;
      default:
        correctMessage = ''
        break;
    }
    if (isCorrect) {
      document.querySelector('input').value = '';
    }
    this.setState((state) => Object.assign({}, state, {
      currentProblem: isCorrect ? this.getRandomProblem() : this.state.currentProblem,
      correctMessage: correctMessage,
      input: isCorrect ? '' : state.input,
      correctMessageTimeoutId: correctMessageTimeoutId
    }));
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
    return (
      <div className="App">
          <h2>{this.state.currentProblem.question}</h2>
          <InputBox value={this.props.input}
            handleChange={(event) => this.updateInput(event)}
            handleKeyPress={(event) => this.handleKeyPress(event)}/>
          <h1>{this.state.correctMessage}</h1>
      </div>
    );
  }
}

export default App;
