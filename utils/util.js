function formatTime(timestamp, format) {
  if (!timestamp) { return; }
  var date = new Date();
  date.setTime(timestamp);
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  var formattedDate = [year, month, day].map(formatNumber).join('-');
  var formattedTime = [hour, minute, second].map(formatNumber).join(':');
  var formattedTimeNoS = [hour, minute].map(formatNumber).join(':');
  var formattedMonth = [month, day].map(formatNumber).join('-');

  if (format === 'd') {
    return formattedDate;
  } else if (format === 's') {
    return formattedDate + ' ' + formattedTime;
  }else if (format === 'm') {
    return formattedMonth + ' ' + formattedTime;
  }else if(format === 'ns') {
    return formattedMonth + ' ' + formattedTimeNoS;
  }

}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatDate: function(value) {
    return formatTime(value, 'd');
  },
  formatTime: function(value) {
    return formatTime(value, 's');
  },
  formatMonth: function(value) {
    return formatTime(value, 'm');
  },
  formatNoS: function(value) {
    return formatTime(value, 'ns');
  }
}
