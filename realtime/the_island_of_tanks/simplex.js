function SimplexNoise(seed) {
    var gradients3D = [
        [1,1,0], [-1,1,0], [1,-1,0], [-1,-1,0],
        [1,0,1], [-1,0,1], [1,0,-1], [-1,0,-1],
        [0,1,1], [0,-1,1], [0,1,-1], [0,-1,-1]
    ];

    var p = [];
    for (var i=0; i < 256; ++i) {
        p[i] = (seed + Math.floor(seed/(i+1))) % 256;
    }

    var perm = [];
    for (var i=0; i < 256; ++i) {
        perm[i]     = p[i];
        perm[i+256] = p[i];
    }

    var dot2D = function(tbl, x, y) {
        return tbl[0]*x + tbl[1]*y;
    };

    var noise2D = function(xin, yin) {
        var n0, n1, n2;
        var f2 = 0.5 * (Math.sqrt(3.0) - 1.0);
        var s  = (xin + yin) * f2;
        var i  = Math.floor(xin+s);
        var j  = Math.floor(yin+s);
        var g2 = (3.0 - Math.sqrt(3.0)) / 6.0;

        var t  = (i+j) * g2;
        var x0 = xin - (i - t);
        var y0 = yin - (j - t);

        var i1, j1;
        if (x0 > y0) {
            i1 = 1;
            j1 = 0;
        }
        else {
            i1 = 0;
            j1 = 1;
        }

        var x1 = x0 - i1 + g2;
        var y1 = y0 - j1 + g2;
        var x2 = x0 - 1.0 + 2.0 * g2;
        var y2 = y0 - 1.0 + 2.0 * g2;

        var ii  = i & 255;
        var jj  = j & 255;
        var gi0 = perm[ii+ perm[jj]] % 12;
        var gi1 = perm[ii+i1+perm[jj+j1]] % 12;
        var gi2 = perm[ii+1+perm[jj+1]] % 12;

        var n0;
        var t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) {
            n0 = 0.0;
        }
        else {
            t0 = t0 * t0;
            n0 = t0 * t0 * dot2D(gradients3D[gi0], x0, y0);
        }

        var n1;
        var t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) {
            n1 = 0.0;
        }
        else {
            t1 = t1 * t1;
            n1 = t1 * t1 * dot2D(gradients3D[gi1], x1, y1);
        }

        var n2;
        var t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) {
            n2 = 0.0;
        }
        else {
            t2 = t2 * t2;
            n2 = t2 * t2 * dot2D(gradients3D[gi2], x2, y2);
        }

        return (70.0 * (n0 + n1 + n2));
    };

    var fractalSum2DNoise = function(x,y,itier) {
        var ret = noise2D(x,y);
        for (var i=1; i < itier; ++i) {
            var n = Math.pow(2, itier);
            ret = ret + (i/n) * noise2D(x*(n/i), y*(n/i));
        }
        return ret;
    };

    var fractalSumAbs2DNoise = function(x,y,itier) {
        var ret = Math.abs(noise2D(x,y));
        for (var i=1; i < itier; ++i) {
            var n = Math.pow(2, itier);
            ret = ret + (i/n) * Math.abs(noise2D(x*(n/i), y*(n/i)));
        }
        return ret;
    };

    var turbulent2DNoise = function(x,y,itier) {
        var ret = Math.abs(noise2D(x,y));
        for (var i=1; i < itier; ++i) {
            var n = Math.pow(2, itier);
            ret = ret + (i/n) * Math.abs(noise2D(x*(n/i), y*(n/i)));
        }
        return Math.sin(x+ret);
    };

    this.noise2D              = noise2D;
    this.fractalSum2DNoise    = fractalSum2DNoise;
    this.fractalSumAbs2DNoise = fractalSumAbs2DNoise;
    this.turbulent2DNoise     = turbulent2DNoise;
};
