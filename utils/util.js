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
  if (format === 'd') {
    return formattedDate;
  } else if (format === 's') {
    return formattedDate + ' ' + formattedTime;
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
  }
}
