var fs = require('fs')
  , path = require('path')
  , highcharts = require('node-highcharts')
  , usercommits = require('./usercommits.json')
  ;
  
var data = {'10+':0, '20+':0, '5-9':0}  
  , length = 0
  , totalchanges = 0
  ;
  
for (var i in usercommits) {
  (function (i) {
    length += 1
    totalchanges += usercommits[i].length
    var l = usercommits[i].length
    if (l > 9 && l < 20) {
      return data['10+'] += 1
    }
    if (l > 19) return data['20+'] += 1
    if (l > 4 && l < 10) return data['5-9'] += 1
    if (!data[l]) data[l] = 0
    data[l] += 1
  })(i)
}

var series = []

series.push(['1', data[1]])
series.push(['2', data[2]])
series.push(['3', data[3]])
series.push(['4', data[4]])
series.push(['5-9', data['5-9']])
series.push(['10+', data['10+']])
series.push(['20+', data['20+']])

console.log(data)
console.log(series)

  var options = {
              chart: {
                  width:800,
                  height:800,
                  plotBackgroundColor: null,
                  plotBorderWidth: null,
                  plotShadow: false
              },
              title: {
                  text: 'User commit data for ' + Object.keys(usercommits).length + ' users in September across ' + totalchanges + ' unique changesets.'
              },
              tooltip: {
          	    pointFormat: '{series.name}: <b>{point.percentage.slice(point.percentage.indexOf("."))}%</b>',
              	percentageDecimals: 1
              },
              plotOptions: {
                  pie: {
                      allowPointSelect: true,
                      cursor: 'pointer',
                      dataLabels: {
                          enabled: true,
                          color: '#000000',
                          connectorColor: '#000000',
                          formatter: function() {
                              return '<b>'+ this.point.name +' changset(s)</b> '+data[this.point.name]+' users <b>'+ parseInt(this.percentage) +'%</b>';
                          }
                      }
                  }
              },
              series: [{
                  type: 'pie',
                  name: 'Browser share',
                  data: series
              }]
            }

highcharts.render(options, function(err, data) {
    if (err) {
        console.log('Error: ' + err);
    } else {
        console.log(data)
        fs.writeFile(path.join(__dirname, 'usersbycommits.svg'), data, function() {
            console.log('Written to userbycommits.svg');
        });
    }
});

// percentage of total commits by users

var shacount = { '1-4':0, '5+':0, '10+':0, '20+':0, '30+':0, '40+':0
               , '50+':0, '60+':0, '70+':0, '80+':0, '90+':0, '100+': 0, '1000+': 0} 

for (var i in usercommits) {
  (function (i) {
    var l = usercommits[i].length
    if (!shacount[l]) shacount[l] = 0
    shacount[l] += l
    
    var l = usercommits[i].length
    if (l < 5) return shacount['1-4'] += l
    if (l < 10) return shacount['5+'] += l
    if (l < 20) return shacount['10+'] += l
    if (l < 30) return shacount['20+'] += l
    if (l < 40) return shacount['30+'] += l
    if (l < 50) return shacount['40+'] += l
    if (l < 60) return shacount['50+'] += l
    if (l < 70) return shacount['60+'] += l
    if (l < 80) return shacount['70+'] += l
    if (l < 90) return shacount['80+'] += l
    if (l < 100) return shacount['90+'] += l
    if (l < 1000) return shacount['100+'] += l
    return shacount['1000+'] += l
  })(i)
}


var shaseries = []

shaseries.push(['1-4', shacount['1-4']])
shaseries.push(['5+', shacount['5+']])
shaseries.push(['10+', shacount['10+']])
shaseries.push(['20+', shacount['20+']])
shaseries.push(['30+', shacount['30+']])
shaseries.push(['40+', shacount['40+']])
shaseries.push(['50+', shacount['50+']])
shaseries.push(['60+', shacount['60+']])
shaseries.push(['70+', shacount['70+']])
shaseries.push(['80+', shacount['80+']])
shaseries.push(['90+', shacount['90+']])
shaseries.push(['100+', shacount['100+']])
shaseries.push(['1000+', shacount['1000+']])


console.log(shacount)
console.log(shaseries)

  var shaoptions = {
              chart: {
                  width:800,
                  height:800,
                  plotBackgroundColor: null,
                  plotBorderWidth: null,
                  plotShadow: false
              },
              title: {
                  text: 'User commit data for ' + Object.keys(usercommits).length + ' users in September across ' + totalchanges + ' unique changesets.'
              },
              tooltip: {
              	percentageDecimals: 1
              },
              plotOptions: {
                  pie: {
                      allowPointSelect: true,
                      cursor: 'pointer',
                      dataLabels: {
                          enabled: true,
                          color: '#000000',
                          connectorColor: '#000000',
                          formatter: function() {
                              return '<b>'+ this.point.name +' changset(s)</b> '+shacount[this.point.name]+' users <b>'+ parseInt(this.percentage) +'%</b>';
                          }
                      }
                  }
              },
              series: [{
                  type: 'pie',
                  name: 'Browser share',
                  data: shaseries
              }]
            }

highcharts.render(shaoptions, function(err, data) {
    if (err) {
        console.log('Error: ' + err);
    } else {
        console.log(data)
        fs.writeFile(path.join(__dirname, 'commitsbyuser.svg'), data, function() {
            console.log('Written to commitsbyuser.svg');
        });
    }
});