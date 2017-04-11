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
          options.format = $attributes.format && $parse($attributes.format)($scope) || 'YYYY-MM-DD';
          options.separator = $attributes.separator && $parse($attributes.separator)($scope) || ' / ';
          options.minDate = $attributes.minDate && $parse($attributes.minDate)($scope);
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

          function datify(date) {
            return moment.isMoment(date) ? date.toDate() : date;
          }

          function momentify(date) {
            return (!moment.isMoment(date)) ? moment(date) : date;
          }

          function format(date) {
            return $filter('date')(datify(date), options.format.replace(/Y/g, 'y').replace(/D/g, 'd')); //date.format(options.format);
          }

          function formatted(dates) {
            //ngModel[ 'startDate' ] = dates.startDate;
            //ngModel[ 'endDate' ] = dates.endDate;
            if (options.singleDatePicker)
              return format(dates.endDate);
            return [ format(dates.startDate), format(dates.endDate) ].join(options.separator);
          }

          function formatView(date) {
            if (options.singleDatePicker)
              return moment(momentify(date).format('YYYY-MM-DD')).toISOString();
            return momentify(date).toISOString();
          }

          function formattedView(dates) {
            ngModel[ 'startDate' ] = dates.startDate;
            ngModel[ 'endDate' ] = dates.endDate;
            if (options.singleDatePicker)
              return formatView(dates.endDate);
            return [ formatView(dates.startDate), formatView(dates.endDate) ].join(options.separator);
          }

          ngModel.$render = function () {
            
            if (!ngModel.$viewValue || !ngModel.startDate) {
              $element.val('');
              return;
            }
            var startDate = momentify(ngModel.startDate);
            var endDate = momentify(ngModel.endDate);
            $element.val(formatted({
              startDate : startDate.local(),
              endDate : endDate.local()
            }));//$element.val(ngModel.$viewValue);
            //console.log(">>>>>>>>>>>>>>DATE render",ngModel);
          };

          $scope.$watch(function () {
            return $parse($attributes.ngModel)($scope);
          }, function (modelValue, oldModelValue) {
            
            
            if (!modelValue || modelValue.length == 0) {
              ngModel.startDate = null;
              ngModel.endDate = null;
              ngModel.$setViewValue('');
              ngModel.$render();
            }
            if (modelValue && !ngModel.startDate) {
              var values = modelValue.split(options.separator);
              if (values.length == 2) {
                ngModel.$setViewValue(formattedView({
                  startDate : momentify(values[ 0 ]),
                  endDate : momentify(values[ 1 ])
                }));
              }
              else if (values.length == 1) {
                ngModel.$setViewValue(formattedView({
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
              $element.data('daterangepicker').startDate = momentify(ngModel.startDate);
              $element.data('daterangepicker').endDate = momentify(ngModel.endDate);
              $element.data('daterangepicker').updateView();
              $element.data('daterangepicker').updateCalendars();
              $element.data('daterangepicker').updateInputText();
            }
          });

          $element.daterangepicker(options, function (start, end, label) {
            //var modelValue = ngModel.$viewValue;
            if (angular.equals(start, ngModel.startDate) && angular.equals(end, ngModel.endDate)) {
              return;
            }

            $scope.$apply(function () {
              
              ngModel.$setViewValue(formattedView({
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
