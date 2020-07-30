function World() {
  this.objects = [];
  this.running = false;
}

World.prototype.add = function(obj) {
  this.objects.push(obj);
  obj.added(this);
};

World.prototype.size = function(width, height) {
  this.width = width;
  this.height = height;
  this.xMin = -(this.xMax = this.width / 2);
  this.yMin = -(this.yMax = this.height / 2);
  return this;
};

World.prototype.run = function(run) {
  this.running = run !== false;
};

World.prototype.tick = function(t) {
  if (this.running) {
    t = Math.min(100, t);
    for (var i = 0, n = this.objects.length; i < n; i++) {
      this.objects[i].tick(t);
    }
  }
};

module.exports.init = new World();
