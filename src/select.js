(function () {
    'use strict';

    var app = angular
        .module('fc.4stSelect', [])
        .directive('mSelect', mSelect);

    var contains = function (container, contained) {
        var node;
        node = contained.parentNode;
        while (node !== null && node !== container) {
            node = node.parentNode;
        }
        return node !== null;
    };

    app.directive("outsideClick", [
        '$document', '$parse',
        function ($document, $parse) {
            return {
                link: function ($scope, $element, $attributes) {
                    var onDocumentClick, scopeExpression;
                    scopeExpression = $attributes.outsideClick;
                    onDocumentClick = function (event) {
                        if (!contains($element[0], event.target)) {
                            $scope.$apply(scopeExpression);
                        }
                    };
                    $document.on("click", onDocumentClick);
                    $element.on("$destroy", function () {
                        $document.off("click", onDocumentClick);
                    });
                }
            };
        }
    ]);

    /**
     * @ngInject
     */
    function mSelect() {

        var template = ['<hr/>',
            '<div class="multile-select" outside-click="vm.hideSelect()">',
            '  <div class="" ng-class="{true: \'ws-content-show\', false: \'ws-content-hide\'}[vm.show]">',
            '    <div class="ws-select-shortcut">',
            '      <label>{{placeholder}}</label>',
            '      <md-button type="button" class="ws-select-button" ng-click="vm.selectAll()"}">All</md-button>',
            '      <md-button type="button" class="ws-select-button" ng-click="vm.selectNone()">None</md-button>',
            '      <md-button type="button" class="ws-select-button" ng-click="vm.selectToggle()">Inverse</md-button>',
            '      <input ng-model="vm.searchStr" class="ws-search-input" placeholder="Search">',
            '      <md-button type="button" class="ws-clear-search" ng-click="vm.searchStr=\'\'">Clear Search</md-button>',
            '      <div class="ws-clear"></div>',
            '    </div>',
            '    <br/>',
            '    <div class="row equal">',
            '      <div class="ws-unselected col-md-6">',
            '       <div class="panel panel-default col-md-12">',
            '           <div class="panel-body">',
            '               <span ng-show="vm.dataUnselected.length === 0" class="ws-none-select">No Result</span>',
            '               <span ng-show="vm.dataUnselected.length > 0" class="ws-none-select">Options</span>',
            '               <hr/>',
            '               <md-checkbox ng-class="{add: mode == \'Add\', remove: mode == \'Remove\'}" ng-checked="false" ng-click="vm.toggle($event, item, false)" ng-repeat="item in vm.dataUnselected">',
            '                   {{item.display}}',
            '               </md-checkbox>',
            '           </div>',
            '       </div>',
            '      </div>',
            '      <div class="ws-selected col-md-6">',
            '       <div class="panel panel-default col-md-12">',
            '           <div class="panel-body">',
            '               <span ng-show="selectedData.length === 0" class="ws-none-select">Nothing Selected</span>',
            '               <span ng-show="selectedData.length > 0" class="ws-none-select">Selected </span>',
            '               <hr/>',
            '               <md-checkbox ng-class="{add: mode == \'Add\', remove: mode == \'Remove\'}" ng-checked="true" ng-click="vm.toggle($event, item, true)" ng-repeat="item in selectedData">',
            '                   {{item.display}}',
            '               </md-checkbox>',
            '           </div>',
            '       </div>',
            '      </div>',
            '    </div>',
            '  </div>',
            '</div>',
        ].join('');

        return {
            restrict: 'EA',
            scope: {
                sourceData: '=',
                selectedData: '=',
                ajaxSource: '@',
                placeholder: '@',
                selectChanged: '&',
                mode: '='
            },
            link: function ($scope) {
                $scope.$on('reset',function(event, data){
                    $scope.reset();
                });
            },
            template: template,
            controller: Controller,
            controllerAs: 'vm'
        };

        /**
         * @ngInject
         */
        function Controller($scope) {
            var vm = this;

            vm.result = 'Please Select';
            vm.show=false;

            vm.dataUnselected =$scope.sourceData;
            vm.searchStr = '';
            vm.dataFetched = false;
            if ($scope.ajaxSource==0) {
                // console.log($scope.sourceData);
                vm.show=true;
                vm.dataFetched = true;
                search('');
            }


            $scope.$watch('[vm.searchStr, sourceData]', function (newVal, oldVal) {
                //search
                if (newVal[0]!=oldVal[0]) {
                    search(newVal[0] || '');
                }

                if (newVal[1]!=oldVal[1] && newVal[1]!=undefined && vm.dataFetched===false) {
                    vm.dataUnselected = $scope.sourceData;
                    vm.show = true;
                    vm.dataFetched = true;
                    search('');
                    // console.log($scope.placeholder + ' data fetched');
                }

                if ($scope.placeholder=='Roles: '  && vm.dataFetched===false) {
                    vm.dataUnselected = $scope.sourceData;
                    vm.show = true;
                    vm.dataFetched = true;
                    search('');
                    // console.log($scope.placeholder + ' data fetched');
                }

            }, true);

            $scope.$watchCollection('selectedData', function (newVal, oldVal) {
                vm.setSearchResult();
                if ($scope.selectChanged && typeof($scope.selectChanged) === 'function') {
                    $scope.selectChanged();
                }
            });

            function search(val) {

                val = val.toUpperCase();
                var tempSelected = $scope.selectedData.map(function (dt) {
                    return dt.display.toUpperCase();
                });
                vm.dataUnselected = $scope.sourceData.filter(function (dt) {
                    dt = dt.display.toUpperCase();
                    return dt.indexOf(val) > -1 && tempSelected.indexOf(dt) === -1;
                });
            }

            vm.hideSelect = function () {
                // vm.show = false;
            };

            vm.showSelect = function () {
                if (vm.show) {
                    // vm.show = false;
                    return;
                }
                vm.show = true;
                vm.searchStr = '';

                vm.dataUnselected = $scope.sourceData.filter(function (dt) {
                    return $scope.selectedData.indexOf(dt) === -1;
                });
            };

            vm.toggle = function (event, item, isExist) {
                event.stopPropagation();
                var idx;
                if (isExist) {
                    idx = $scope.selectedData.indexOf(item);
                    $scope.selectedData.splice(idx, 1);
                    // vm.dataUnselected.push(item);
                    search(vm.searchStr);
                } else {
                    idx = vm.dataUnselected.indexOf(item);
                    $scope.selectedData.push(item);
                    vm.dataUnselected.splice(idx, 1);
                }
                vm.setSearchResult();
            };

            vm.setSearchResult = function () {
                var length = $scope.selectedData.length;
                if (length === 1) {
                    vm.result = $scope.selectedData[0];
                } else if (length === 0) {
                    vm.result = 'Please Select';
                } else if (length === $scope.sourceData.length) {
                    vm.result = 'Select All';
                } else {
                    vm.result = 'Select Multiple';
                }
            };

            vm.selectAll = function () {
                vm.result = 'Select All';
                // $scope.selectedData = [].concat($scope.sourceData);
                $scope.selectedData = $scope.selectedData.concat(vm.dataUnselected);
                vm.dataUnselected = [];
            };

            vm.selectNone = function () {
                vm.result = 'Please Select';
                // vm.dataUnselected = [].concat($scope.sourceData);
                $scope.selectedData = [];
                search(vm.searchStr);
            };

            vm.selectToggle = function () {
                var temp = [].concat(vm.dataUnselected);
                vm.dataUnselected = [].concat($scope.selectedData);
                $scope.selectedData = temp;
                vm.setSearchResult();
            };

            $scope.reset = function() {
                vm.result = 'Please Select';
                vm.searchStr = '';
                // vm.dataUnselected = [].concat($scope.sourceData);
                $scope.selectedData = [];
                search('');
            };
        }
    }

})();
