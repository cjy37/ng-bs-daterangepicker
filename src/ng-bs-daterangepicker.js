/**
 * @license ng-bs-daterangepicker v0.0.8
 * (c) 2013 Luis Farzati http://github.com/luisfarzati/ng-bs-daterangepicker
 * License: MIT
 */
(function (angular) {

  'use strict';
  moment.locale('zh-cn');

  angular
    .module('ngBootstrap', [])
    .directive('input', [ '$compile', '$parse', '$filter', function ($compile, $parse, $filter) {
      return {
        restrict : 'E',
        require : '?ngModel',
        link : function ($scope, $element, $attributes, ngModel) {
          
          if ($attributes.type !== 'daterange' || ngModel === null) {
            return;
          }

          var options = {};

          //moment 的格式
          options.format = $attributes.format && $parse($attributes.format)($scope) || 'YYYY-MM-DD';

          //angular 的格式
          options.formatFilter = options.format.replace(/Y/g, 'y').replace(/D/g, 'd');

          //分隔符
          options.separator = $attributes.separator && $parse($attributes.separator)($scope) || ' / ';

          //最小时间
          options.minDate = $attributes.minDate && $parse($attributes.minDate)($scope);

          //最大时间
          options.maxDate = $attributes.maxDate && $parse($attributes.maxDate)($scope);

          $attributes.limit = $attributes.limit && $parse($attributes.limit)($scope);

          options.dateLimit = $attributes.limit && moment.duration.apply(this, $attributes.limit.split(' ').map(function (elem, index) {
              return index === 0 && parseInt(elem, 10) || elem;
            }));

          options.locale = $attributes.locale && $parse($attributes.locale)($scope);
          options.opens = $attributes.opens || $parse($attributes.opens)($scope);
          options.singleDatePicker = $attributes.singleDatePicker && $parse($attributes.singleDatePicker)($scope);
          if (!options.singleDatePicker)
            options.ranges = $attributes.ranges && $parse($attributes.ranges)($scope);

          if ($attributes.enabletimepicker) {
            options.timePicker = true;
            angular.extend(options, $parse($attributes.enabletimepicker)($scope));
          }

          // to js Date object
          function datify(date) {
            return moment.isMoment(date) ? date.toDate() : date;
          }

          // to moment date object
          function momentify(date) {
            return (!moment.isMoment(date)) ? moment(date) : date;
          }

          // format to local format string
          function formatView(date) {
            return $filter('date')(datify(date), options.formatFilter);
          }

          function formattedView(dates) {
            if (options.singleDatePicker)
              return formatView(dates.startDate);
            return [ formatView(dates.startDate), formatView(dates.endDate) ].join(options.separator);
          }

          // format to utc format string
          function formatValue(date) {
            return momentify(date).toISOString();
          }

          function formattedValue(dates) {
            ngModel[ 'startDate' ] = dates.startDate;
            ngModel[ 'endDate' ] = dates.endDate;
            if (options.singleDatePicker)
              return formatValue(dates.startDate);
            return [ formatValue(dates.startDate), formatValue(dates.endDate) ].join(options.separator);
          }

          // render view display
          ngModel.$render = function () {
            // no data
            if (!ngModel.$viewValue || !ngModel.startDate) {
              $element.val('');
              return;
            }
            // setter view display
            $element.val(formattedView({
              startDate : momentify(ngModel.startDate).local(),
              endDate : momentify(ngModel.endDate).local()
            }));
          };

          // on ng-model change
          $scope.$watch(function () {
            return $parse($attributes.ngModel)($scope);
          }, function (modelValue, oldModelValue) {
            
            // no data
            if (!modelValue || modelValue.length == 0) {
              ngModel.startDate = null;
              ngModel.endDate = null;
              ngModel.$setViewValue('');
              ngModel.$render();
            }

            // has date (string format data)
            if (modelValue && !ngModel.startDate) {
              var values = modelValue.split(options.separator);
              if (values.length == 2) {
                ngModel.$setViewValue(formattedValue({
                  startDate : momentify(values[ 0 ]),
                  endDate : momentify(values[ 1 ])
                }));
              }
              else if (values.length == 1) {
                ngModel.$setViewValue(formattedValue({
                  startDate : momentify(values[ 0 ]),
                  endDate : momentify(values[ 0 ])
                }));
              }
              ngModel.$render();
              //return;
            }

            if (oldModelValue !== modelValue) {
              return;
            }

            if (ngModel.startDate) {
              // jquery 控件操作
              var drp = $element.data('daterangepicker');
              
              drp.startDate = momentify(ngModel.startDate);
              drp.endDate = momentify(ngModel.endDate);

              if (drp.hasOwnProperty('updateInputText')) {
                drp.updateView();
                drp.updateCalendars();
                drp.updateInputText();
              }
            }
          });

          // jquery 控件初始化
          $element.daterangepicker(options, function (start, end, label) {
            //var modelValue = ngModel.$viewValue;
            if (angular.equals(start, ngModel.startDate) && angular.equals(end, ngModel.endDate)) {
              return;
            }

            $scope.$apply(function () {
              
              ngModel.$setViewValue(formattedValue({
                startDate : (moment.isMoment(ngModel.startDate)) ? start : start.toDate(),
                endDate : (moment.isMoment(ngModel.endDate)) ? end : end.toDate()
              }));
              ngModel.$render();
            });
          });
        }
      };
    } ]);

})(angular);
