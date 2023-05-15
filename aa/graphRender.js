
const QuickChart = require('quickchart-js');
async function renderGraph(message, numOfUsersToGraph, topUsers) {
  const chart = new QuickChart();
  chart.setWidth(800);
  chart.setHeight(800);
  try {
    if (numOfUsersToGraph === 'top3') {
      chart.setConfig({
        type: 'bar',
        data: {
          labels: [topUsers[0].nickName, topUsers[1].nickName, topUsers[2].nickName],
          datasets: [{ label: 'Points', data: [topUsers[0].points, topUsers[1].points, topUsers[2].points] }],
        },
      });
      // Print the chart URL
      const url = await chart.getShortUrl();
      message.reply(`Top 3 users by point value: ${url}`);
    }
    if (numOfUsersToGraph === 'top5') {
      chart.setConfig({
        type: 'bar',
        data: {
          labels: [topUsers[0].nickName, topUsers[1].nickName, topUsers[2].nickName, topUsers[3].nickName, topUsers[4].nickName],
          datasets: [{ label: 'Points', data: [topUsers[0].points, topUsers[1].points, topUsers[2].points, topUsers[3].points, topUsers[4].points] }],
        },
      });
      // Print the chart URL
      const url = await chart.getShortUrl();
      message.reply(`Top 5 users by point value: ${url}`);
    }
    if (numOfUsersToGraph === 'top10') {
      chart.setConfig({
        type: 'bar',
        data: {
          labels: [topUsers[0].nickName, topUsers[1].nickName, topUsers[2].nickName, topUsers[3].nickName, topUsers[4].nickName, topUsers[5].nickName,
            topUsers[6].nickName, topUsers[7].nickName, topUsers[8].nickName, topUsers[9].nickName],
          datasets: [{
            label: 'Points',
            data: [topUsers[0].points, topUsers[1].points, topUsers[2].points, topUsers[3].points, topUsers[4].points,
              topUsers[5].points, topUsers[6].points, topUsers[7].points, topUsers[8].points, topUsers[9].points],
          }],
        },
      });
      // Print the chart URL
      const url = await chart.getShortUrl();
      message.reply(`Top 10 users by point value: ${url}`);
    }
  } catch {
    message.reply('Error, not enough registered students');
  }
}

module.exports = { renderGraph };
