import { Component } from '@angular/core';
import * as io from 'socket.io-client';
import { ChartType, ChartOptions, ChartDataSets } from 'chart.js';
import {
  SingleDataSet,
  Label,
  monkeyPatchChartJsLegend,
  monkeyPatchChartJsTooltip,
} from 'ng2-charts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  poll: Poll;
  socket: SocketIOClient.Socket;
  selectedOption: string;

  chartType: ChartType = 'pie';
  chartLegend = true;
  chartPlugins = [];
  chartOptions: ChartOptions = {
    responsive: true,
  };
  optionCount: number = 0;
  chartColours = [
    {
      backgroundColor: [],
    },
  ];

  constructor() {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
    this.socket = io.connect();
  }

  ngOnInit() {
    this.listenToEvents();
  }

  listenToEvents() {
    this.socket.on('newPoll', (newPoll) => {
      console.log('newPoll');

      this.poll = newPoll.msg;
      // If option length has changed, we need to update the
      if (this.poll.options.length !== this.optionCount) {
        this.optionCount = this.poll.options.length;
        this.updateColours();
      }
    });
  }

  // Updates the colours
  // Occurs when the number of datapoints changes
  updateColours() {
    this.chartColours[0].backgroundColor = new Array(this.optionCount)
      .fill(null)
      .map((_, i) => this.ithColour(i, this.optionCount));
  }

  // Generates evenlly spaced rainbow colours
  ithColour(i, totalColours) {
    const r = 255 * (i / totalColours);
    const g = 255 - r;
    const b = 127 - (r % 255);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
  }

  sendMessage() {
    const selectionOptionNumber = +this.selectedOption;
    if (!this.selectedOption) return;
    if (isNaN(selectionOptionNumber)) return;

    // Update the poll locally so we dont need to be sent updated poll
    const optionIndex = this.poll.options.findIndex(
      (option) => option.value === selectionOptionNumber
    );
    this.incOption(optionIndex);

    // Send vote to server
    this.socket.emit('vote', selectionOptionNumber);
  }

  incOption(optIndex: number) {
    this.poll.options[optIndex].votes += 1;
  }

  getData(): number[] {
    return this.poll.options.map((option) => option.votes);
  }

  getLabels(): Label[] {
    return this.poll.options.map((option) => option.label);
  }
}

type Poll = {
  question: String;
  options: PollOption[];
};

type PollOption = {
  label: Label;
  value: number;
  votes: number;
};
