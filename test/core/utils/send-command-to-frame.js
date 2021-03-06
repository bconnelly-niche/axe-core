describe('axe.utils.sendCommandToFrame', function() {
  'use strict';

  var fixture = document.getElementById('fixture');

  afterEach(function() {
    fixture.innerHTML = '';
    axe._tree = undefined;
    axe._selectorData = undefined;
  });

  var assertNotCalled = function() {
    assert.ok(false, 'should not be called');
  };

  it('should timeout if there is no response from frame', function(done) {
    var orig = window.setTimeout;
    window.setTimeout = function(fn, to) {
      if (to === 30000) {
        assert.ok('timeout set');
        fn();
      } else {
        // ping timeout
        return orig(fn, to);
      }
      return 'cats';
    };

    var frame = document.createElement('iframe');
    frame.addEventListener('load', function() {
      axe._tree = axe.utils.getFlattenedTree(document.documentElement);
      axe.utils.sendCommandToFrame(
        frame,
        {},
        function(result) {
          assert.equal(result, null);
          done();
        },
        assertNotCalled
      );
      window.setTimeout = orig;
    });

    frame.id = 'level0';
    frame.src = '../mock/frames/zombie-frame.html';
    fixture.appendChild(frame);
  });

  it('should respond once when no keepalive', function(done) {
    var frame = document.createElement('iframe');
    frame.addEventListener('load', function() {
      axe.utils.sendCommandToFrame(
        frame,
        {
          number: 1
        },
        function() {
          assert.isTrue(true);
          done();
        },
        assertNotCalled
      );
    });

    frame.id = 'level0';
    frame.src = '../mock/frames/responder.html';
    fixture.appendChild(frame);
  });

  it('should respond multiple times when keepalive', function(done) {
    var number = 3;
    var called = 0;
    var frame = document.createElement('iframe');
    frame.addEventListener('load', function() {
      setTimeout(function() {
        axe.utils.sendCommandToFrame(
          frame,
          {
            number: number,
            keepalive: true
          },
          function() {
            called += 1;
            if (called === number) {
              assert.isTrue(true);
              done();
            }
          },
          assertNotCalled
        );
      }, 500);
    });

    frame.id = 'level0';
    frame.src = '../mock/frames/responder.html';
    fixture.appendChild(frame);
  });

  it('should respond once when no keepalive', function(done) {
    var number = 1;
    var called = 0;
    var frame = document.createElement('iframe');
    frame.addEventListener('load', function() {
      axe.utils.sendCommandToFrame(
        frame,
        {
          number: number
        },
        function() {
          called += 1;
          if (called === number) {
            assert.isTrue(true);
            done();
          } else {
            throw new Error('should not have been called');
          }
        },
        assertNotCalled
      );
    });

    frame.id = 'level0';
    frame.src = '../mock/frames/responder.html';
    fixture.appendChild(frame);
  });
});
