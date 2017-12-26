function archive () {
  var getUrl = function (page, size) {
    return '/archive?page=' + page + '&size=' + size
  }

  return new window.Pagination('archive-nav', {
    next: function (state) {
      location.href = getUrl(state.page + 1, state.size)
    },
    prev: function (state) {
      location.href = getUrl(state.page - 1, state.size)
    }
  })
}

archive()
