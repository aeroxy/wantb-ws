var init = false;
var tempCount = 0;
var tempAmt = 0;
var tempTodayCount = [];
var tempTodayAmt = [];
var app = angular.module('WCTB',['ngMaterial', 'ngMessages', 'ngWebSocket']);
app.controller('AppCtrl',function($scope, $http, $sce, $q, $websocket){
  var ws = $websocket('ws://60.205.225.56:9503');
  ws.onOpen(function(){  
    console.log("Socket has been opened!");
  });
  ws.onError(function(){  
    console.log("Socket has an error!");
  });
  ws.onMessage(function(message){
    if (!init) {
      console.log(JSON.parse(message.data));
      $scope.data = JSON.parse(message.data);
      $scope.main = $scope.data.initData.today.summary;
      $scope.overviews = [
        {
          "name": "交易笔数",
          "volume": $sce.trustAsHtml($scope.main.transactionTotalCount + '<span>笔</span>')
        },{
          "name": "支付宝交易笔数",
          "volume": $sce.trustAsHtml($scope.main.alipayTotalCount + '<span>笔</span>')
        },{
            "name": "微信交易笔数",
            "volume": $sce.trustAsHtml($scope.main.wxTotalCount + '<span>笔</span>')
        },{
            "name": "交易总金额",
            "volume": $sce.trustAsHtml($scope.main.transactionTotalAmt + '<span>元</span>')
        },{
            "name": "支付宝交易总金额",
            "volume": $sce.trustAsHtml($scope.main.alipayTotalAmt + '<span>元</span>')
        },{
            "name": "微信交易总金额",
            "volume": $sce.trustAsHtml($scope.main.wxTotalAmt + '<span>元</span>')
        },{
            "name": "活跃门店数",
            "volume": $sce.trustAsHtml($scope.main.transactionTotalPosCount + '<span>个</span>')
        },
      ];
      $scope.lists = [];
      for (var key in $scope.data.initData.list) {
        var newlist = []; 
        newlist.push($scope.data.initData.list[key].trans_time);
        newlist.push($scope.data.initData.list[key].node_name);
        newlist.push($scope.data.initData.list[key].exchange_amt);
        newlist.push($scope.data.initData.list[key].type);
        newlist.push($scope.data.initData.list[key].pay_type);
        $scope.lists.push(newlist);
      }
      var datanow_master = $scope.data.initData.today.periodSummary.count;
      var datathen_master = $scope.data.initData.history.periodSummary.count;
      var datanow_total_master = [];
      var datathen_total_master = [];
      for (var key in $scope.data.initData.today.periodSummary.amt) {
        datanow_total_master.push(Number($scope.data.initData.today.periodSummary.amt[key]));
      }
      for (var key in $scope.data.initData.history.periodSummary.amt) {
        datathen_total_master.push(Number($scope.data.initData.history.periodSummary.amt[key]));
      }
      var currentdate = new Date();
      var currenttime = (currentdate.getHours() * 6) + Math.floor(currentdate.getMinutes() / 10);
      var currentyear = currentdate.getFullYear();
      var currentmonth = currentdate.getMonth();
      var today = currentdate.getDate();
      var datanow = datanow_master.slice(0, currenttime);
      var datanow_total = datanow_total_master.slice(0, currenttime);
      function create(){
        currenttime++;
        var datathen = datathen_master.slice(0, currenttime - 1);
        var datathen_total = datathen_total_master.slice(0, currenttime - 1);
        // function getLastWeek(){
        //   var today = new Date();
        //   var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        //   return lastWeek ;
        // }
        // var lastWeek = getLastWeek();
        // var lastWeekMonth = lastWeek.getMonth();
        // var lastWeekDay = lastWeek.getDate();
        // var lastWeekYear = lastWeek.getFullYear();
        // var todaySummary = Object.values($scope.data.initData.today.periodSummary);
        // for(var i = 0; i<todaySummary.length; i++){
        //   datanow.push(todaySummary[i].transactionTotalCount);
        //   datanow_total.push(Number(todaySummary[i].transactionTotalAmt));
        // }
        tempTodayCount = [];
        tempTodayAmt = [];
        if (init) {
          tempTodayCount.push(tempCount * 9);
          tempAmt = tempAmt.toFixed(2);
          tempAmt = parseFloat(tempAmt) * 9;
          tempTodayAmt.push(tempAmt);
          datanow = datanow.concat(tempTodayCount);
          datanow_total = datanow_total.concat(tempTodayAmt);
        }
        // var historySummary = Object.values($scope.data.initData.history.periodSummary);
        // for(var i = 0; i<historySummary.length; i++){
        //   datathen.push(historySummary[i].transactionTotalCount);
        //   datathen_total.push(Number(historySummary[i].transactionTotalAmt));
        // }
        Highcharts.chart('volume',{
          chart: {
            type: 'line',
          },
          title: {
            text: '',
          },
          legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom',
            floating: false,
          },
          xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
              day: '%H:%M'
            },
          },
          yAxis: {
            title: {
              text: '交易笔数',
              enabled: false,
            }
          },
          tooltip: {
            shared: true,
            valueSuffix: '笔'
          },
          credits: {
            enabled: false
          },
          plotOptions: {
            line: {
              animation: false,
            }
          },
          series: [{
            name: '上周同期',
            data: datathen,
            pointStart: Date.UTC(currentyear, currentmonth, today),
            pointInterval: 604000,
            color: '#00a1af',
          }, {
            name: '今天',
            data: datanow,
            pointStart: Date.UTC(currentyear, currentmonth, today),
            pointInterval: 604000,
            color: '#ff6c36',
          }]
        });
        Highcharts.chart('total',{
          chart: {
            type: 'line',
          },
          title: {
            text: '',
          },
          legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom',
            floating: false,
          },
          xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
              day: '%H:%M'
            },
          },
          yAxis: {
            title: {
              text: '交易金额',
              enabled: false,
            }
          },
          tooltip: {
            shared: true,
            valueSuffix: '元'
          },
          credits: {
            enabled: false
          },
          plotOptions: {
            line: {
              animation: false,
            }
          },
          series: [{
            name: '上周同期',
            data: datathen_total,
            pointStart: Date.UTC(currentyear, currentmonth, today),
            pointInterval: 604000,
            color: '#00a1af',
          }, {
            name: '今天',
            data: datanow_total,
            pointStart: Date.UTC(currentyear, currentmonth, today),
            pointInterval: 604000,
            color: '#ff6c36',
          }]
        });
      }
      create();
      setInterval(function(){
        create();
        tempCount = 0;
        tempAmt = 0;
      }, 600000);
      init = true;
    } else {
      var pushData = JSON.parse(message.data);
      $scope.newdata = pushData.data;
      function addlist(){
        var newlist = [];
        newlist.push($scope.newdata.trans_time);
        newlist.push($scope.newdata.node_name);
        newlist.push($scope.newdata.exchange_amt);
        $scope.main.transactionTotalAmt = (parseFloat($scope.main.transactionTotalAmt) + parseFloat(newlist[2])).toFixed(2);
        console.log(newlist[2]);
        tempAmt = tempAmt + newlist[2];
        console.log(tempAmt);
        $scope.main.transactionTotalCount++;
        tempCount++;
        console.log(tempCount);
        newlist.push($scope.newdata.type);
        if ($scope.newdata.code_type==101){
          $scope.main.wxTotalAmt = (parseFloat($scope.main.wxTotalAmt) + parseFloat(newlist[2])).toFixed(2);
          $scope.main.wxTotalCount++;
        } else if ($scope.newdata.code_type==100){
          $scope.main.alipayTotalAmt = (parseFloat($scope.main.alipayTotalAmt) + parseFloat(newlist[2])).toFixed(2);
          $scope.main.alipayTotalCount++;
        }
        newlist.push('扫码');
        $scope.lists.unshift(newlist);
        if ($scope.lists.length > 30) {$scope.lists.splice(-1,1)}
        $scope.overviews = [
          {
            "name": "交易笔数",
            "volume": $sce.trustAsHtml($scope.main.transactionTotalCount + '<span>笔</span>')
          },{
            "name": "支付宝交易笔数",
            "volume": $sce.trustAsHtml($scope.main.alipayTotalCount + '<span>笔</span>')
          },{
              "name": "微信交易笔数",
              "volume": $sce.trustAsHtml($scope.main.wxTotalCount + '<span>笔</span>')
          },{
              "name": "交易总金额",
              "volume": $sce.trustAsHtml($scope.main.transactionTotalAmt + '<span>元</span>')
          },{
              "name": "支付宝交易总金额",
              "volume": $sce.trustAsHtml($scope.main.alipayTotalAmt + '<span>元</span>')
          },{
              "name": "微信交易总金额",
              "volume": $sce.trustAsHtml($scope.main.wxTotalAmt + '<span>元</span>')
          },{
              "name": "活跃门店数",
              "volume": $sce.trustAsHtml($scope.main.transactionTotalPosCount + '<span>个</span>')
          },
        ];
        $scope.$apply();
      }
      addlist();
    }
  });
});
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
function getRandomDouble(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return (Math.random() * (max - min)).toFixed(2) + min;
}
function pad(num, size) {
  var s = num + '';
  while (s.length < size) s = '0' + s;
  return s;
}
$(window).on('load',function(){
  $('html').removeClass('loading');
  $('#loading').remove();
});