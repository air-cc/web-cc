import $ from 'jquery'

function pagination () {
  function Pagination (name, opts) {
    this.name = name

    this.$el = $('#' + name).first()
    this.$prevBtn = this.$el.find('.prev-btn').first()
    this.$nextBtn = this.$el.find('.next-btn').first()

    opts = opts || {}
    this._prev = opts.prev
    this._next = opts.next

    this.$prevBtn.on('click', this.prev.bind(this))
    this.$nextBtn.on('click', this.next.bind(this))

    const $page = this.$el.find('.page').first()
    const page = typeof opts.page === 'number' ? opts.page
      : Number($page.html()) || 1
    $page.html(page)

    const $size = this.$el.find('.size').first()
    const size = typeof opts.size === 'number' ? opts.size
      : Number($size.html()) || 0
    $size.html(size)

    const $total = this.$el.find('.total').first()
    const total = typeof opts.total === 'number' ? opts.total
      : Number($total.html()) || 0
    $total.html(total)

    const $count = this.$el.find('.count').first()
    const count = typeof opts.count === 'number' ? opts.count
      : Number($count.html()) || 0
    $count.html(count)

    this.state = {
      page,
      size,
      total,
      count
    }

    this.canPrev = (this.state.page > 1)
    this.canNext = (this.state.page < this.state.total)
  }

  Pagination.prototype.prev = function () {
    if (this.canPrev && (typeof this._prev === 'function')) {
      this._prev(this.state)
    }
  }

  Pagination.prototype.next = function () {
    if (this.canNext && (typeof this._next === 'function')) {
      this._next(this.state)
    }
  }

  window.Pagination = Pagination
}

pagination()
