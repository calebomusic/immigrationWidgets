const generateGraph = require("./generateGraph.js");
import React from 'react';

// Include props for the question, beforeGuess button, and answertext

// Make div for question, beforeGuess button, answerText
  // Make sure answerText can be rendered as HTML
  // Maybe just take in those as a react Component

// props = options, graphId, question, button, answerText

// TODO: move data xAxis and yAxis titles to options

class GraphWidget extends React.Component {
  constructor(props) {
    this.state = { graphId: props.graphId,
                   options: props.options
                 };
  }

  componentDidMount() {
    generateGraph(this.state.graphId, this.state.options);
  }

  render() {
    return(
      <div></div>
    )
  }
}

export default GraphWidget;

// <div id={'graphWidget-' + props.graphId}>
//   <div className={'before-' + props.graphId}>
//
//   </div>
//   <div id={'beforeGuess-' + props.graphId}
//        className={'beforeGuessComplete-' + props.graphId}>
//
//   </div>
//   <div className="hidden"
//        id={'answerText-' + props.graphId}>
//
//   </div>
// </div>
