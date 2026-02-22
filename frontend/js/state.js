// shared state
var students = [], programs = [], colleges = [];
var deleteFn = null;
var pages    = { student: 1, program: 1, college: 1 };
var filtered = { student: [], program: [], college: [] };
var original = { student: [], program: [], college: [] };
var programCollegeFilter = null;
var ROW_HEIGHT  = 46;
var PAGE_CHROME = 220;
var go = window.go.main.App;
var sort = { student: { col: 'ID', asc: true }, program: { col: 'Code', asc: true }, college: { col: 'Code', asc: true } };

function pageSize() {
  return Math.max(5, Math.floor((window.innerHeight - PAGE_CHROME) / ROW_HEIGHT));
}