(function (angular) {
  const app = angular.module('postsapp', []);

  app.factory('service', service);

  service.$inject = ['$http'];

  function service($http) {
    return {
      getPosts(page, limit) {
        return $http.get(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`)
          .then(resp => resp.data)
          .catch(err => []);
      },
      getComments(postId) {
        return $http.get(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`)
          .then(resp => resp.data)
          .catch(err => []);
      }
    }
  }

  app.controller('mainController', mainController);

  mainController.$inject = ['service', '$scope'];

  function mainController(service, $scope) {
    const vm = this;
    vm.postsPerPage = 20;
    vm.page = 1;
    vm.posts = [];
    vm.loadingPosts = false;

    $scope.$watch('vm.page', function () {
      vm.loadingPosts = true;
      service.getPosts(vm.page, vm.postsPerPage).then(posts => {
        vm.posts = posts;
        vm.loadingPosts = false;
      });
    });
  }

  app.component('comment', {
    template: `
        <header class="comment-header">
          {{vm.comment.email}}: {{vm.comment.name}}
        </header>
        <p class="comment-body">{{vm.comment.body}}</p>
        <hr>
    `,
    bindings: {
      comment: '<'
    },
    controllerAs: 'vm'
  });

  app.component('post', {
    template: `
        <h2 ng-bind="vm.post.id + ': ' + vm.post.title"></h2>
        <p ng-bind="vm.post.body"></p>
        <div class="post-footer">
          <button type="button" class="show-comments-btn" ng-click="vm.toggleComments(vm.post)" ng-show="!vm.loadingComments">
            {{vm.showComments ? 'Hide comments' : 'Show comments'}}
          </button>
          <div class="spinner" ng-show="vm.loadingComments"></div>
        </div>
        <div class="comments-wrapper" ng-show="vm.showComments">
          <div class="comment" ng-repeat="comment in vm.comments track by comment.id">
            <comment comment="comment"></comment>
          </div>
        </div>
    `,
    bindings: {
      post: '<'
    },
    controllerAs: 'vm',
    controller: postComponentController
  });

  postComponentController.$inject = ['service'];

  function postComponentController(service) {
    const vm = this;
    vm.showComments = false;
    vm.loadingComments = false;
    vm.comments = [];

    vm.toggleComments = function () {
      vm.showComments = !vm.showComments;
      if (vm.showComments && !vm.comments.length) {
        vm.loadingComments = true;
        service.getComments(vm.post.id)
          .then(comments => {
            vm.comments = comments;
            vm.loadingComments = false;
          });
      }
    }
  }


})(angular);
