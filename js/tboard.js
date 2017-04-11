var init = false;
var app = angular.module('WCTB',['ngMaterial', 'ngMessages', 'ngWebSocket']);
app.controller('AppCtrl',function($scope, $http, $sce, $q, $websocket){
  var ws = $websocket('ws://10.10.1.134:9503');
  ws.onOpen(function(){  
    console.log("Socket has been opened!");
  });
  ws.onError(function(){  
    console.log("Socket has an error!");
  });
  ws.onMessage(function(message){
    if (!init) {
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
      console.log($scope.data.initData.list);
      for (var key in $scope.data.initData.list) {
        let newlist = []; 
        newlist.push($scope.data.initData.list[key].trans_time);
        newlist.push($scope.data.initData.list[key].node_name);
        newlist.push($scope.data.initData.list[key].exchange_amt);
        newlist.push($scope.data.initData.list[key].type);
        newlist.push($scope.data.initData.list[key].pay_type);
        $scope.lists.push(newlist);
      }
      function create(){
        var currentdate = new Date();
        var currentyear = currentdate.getFullYear();
        var currentmonth = currentdate.getMonth();
        var today = currentdate.getDate();
        // function getLastWeek(){
        //   let today = new Date();
        //   let lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        //   return lastWeek ;
        // }
        // var lastWeek = getLastWeek();
        // var lastWeekMonth = lastWeek.getMonth();
        // var lastWeekDay = lastWeek.getDate();
        // var lastWeekYear = lastWeek.getFullYear();
        var datanow = [];
        var datanow_total = [];
        var todaySummary = Object.values($scope.data.initData.today.periodSummary);
        for(var i = 0; i<todaySummary.length; i++){
          datanow.push(todaySummary[i].transactionTotalCount);
          datanow_total.push(Number(todaySummary[i].transactionTotalAmt));
        }
        var datathen = [];
        var datathen_total = [];
        var historySummary = Object.values($scope.data.initData.history.periodSummary);
        for(var i = 0; i<historySummary.length; i++){
          datathen.push(historySummary[i].transactionTotalCount);
          datathen_total.push(Number(historySummary[i].transactionTotalAmt));
        }
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
            layout: 'vertical',
            align: 'left',
            verticalAlign: 'top',
            x: 150,
            y: 100,
            floating: true,
            borderWidth: 1,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#DDDDDD'
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
      init = true;
    } else {
      let pushData = JSON.parse(message.data);
      $scope.data = pushData.data;
      console.log($scope.data);
      function addlist(){
        let newlist = [];
        newlist.push($scope.data.trans_time);
        newlist.push($scope.data.node_name);
        newlist.push($scope.data.exchange_amt);
        $scope.main.transactionTotalAmt = (parseFloat($scope.main.transactionTotalAmt) + parseFloat(newlist[2])).toFixed(2);
        $scope.main.transactionTotalCount++;
        newlist.push($scope.data.type);
        if ($scope.data.code_type==101){
          $scope.main.wxTotalAmt = (parseFloat($scope.main.wxTotalAmt) + parseFloat(newlist[2])).toFixed(2);
          $scope.main.wxTotalCount++;
        } else if ($scope.data.code_type==100){
          $scope.main.alipayTotalAmt = (parseFloat($scope.main.alipayTotalAmt) + parseFloat(newlist[2])).toFixed(2);
          $scope.main.alipayTotalCount++;
        }
        newlist.push('扫码');
        $scope.lists.unshift(newlist);
        console.log(newlist);
        console.log($scope.lists);
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