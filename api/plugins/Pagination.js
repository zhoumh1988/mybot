const Pagination = function(opts) {
    for (let prop in opts) {
        if (typeof prop == 'string' && opts[prop] != null) {
            this[prop] = opts[prop];
        }
    }
};

Pagination.prototype.toJSON = function() {
    let pagenum = parseInt((this.total + this.pagesize - 1) / this.pagesize);
    let isLast = pagenum == this.pageno + 1;
    return {
        pageno: this.pageno,
        pagesize: this.pagesize,
        pagenum: pagenum,
        total: this.total,
        isLast: isLast,
        pageList: this.pageList,
    };
};

Pagination.prototype.setTotal = function(total) {
    this.total = parseInt(total || 0);
};

Pagination.prototype.setPageno = function(pageno) {
    this.pageno = parseInt(pageno || 0);
};

Pagination.prototype.setPagesize = function(pagesize) {
    this.pagesize = parseInt(pagesize || 0);
};

Pagination.prototype.setPageList = function(pageList) {
    this.pageList = pageList;
};

module.exports = Pagination;