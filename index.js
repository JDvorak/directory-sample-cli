const fs = require('fs')
const Alea = require('alea')
const glob = require('pull-glob')
const path = require('path')
const yargs = require('yargs')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const Abortable = require('pull-abortable')
var Pushable = require('pull-pushable')
var paramap = require('pull-paramap')
var cat = require('pull-cat')

let argv = yargs
  .usage('Usage: $0 [OPTIONS] DIRECTORY TARGET')
  .example('$0 --rate 0.2 dataset sample', 'set sampling rate to be 0.2, and select roughly 20% of the files from dataset and copy them to sample, output to stdout')
  .example('$0 --size 50 --seed "dog" --copy dataset sample', 'Dynamically set sampling rate to take 50 files from the directory, with the seed of "dog"')
  .describe({
    seed: 'string to seed the random operation, if false: random seed [default: false]',
    rate: 'set sampling rate as a floating point number',
    size: 'set maximum sample size, if not set',
    move: 'move from directory to target',
    copy: 'copy from directory to target'
  })
  .boolean('copy')
  .boolean('move')
  .check(function xorMoveCopy (argv) {
    if (!xor(argv.move, argv.copy)) {
      throw new Error('Error: Move and copy cannot both be set to true.')
    } else {
      return true
    }
  })
  .check(function xorRateSize (argv) {
    if (!xor(argv.rate, argv.size)) {
      throw new Error('Error: Sample size or sampling rate flags must be set, and cannot be used together. Sample size dynamically sets sampling rate.')
    } else {
      return true
    }
  })
  .argv

var sampler = sampleFiles(argv)

if (argv.copy) {
  pull(sampler, copyFiles(argv._[argv._.length - 1]))
} else if (argv.move) {
  pull(sampler, moveFiles(argv._[argv._.length - 1]))
} else {
  pull(sampler, toPull(process.stdout))
}

function copyFiles (targetDir) {
  return pull(
    paramap(function (filepath, cb) {
      fs.copyFile(filepath, path.join(targetDir, path.parse(filepath).base), (err) => {
        if (err) throw err
        cb()
      })
    }),
    pull.drain()
  )
}

function moveFiles (targetDir) {
  return pull(
    paramap(function (filepath, cb) {
      fs.rename(filepath, path.join(targetDir, path.parse(filepath).base), (err) => {
        if (err) throw err
        cb()
      })
    }),
    pull.drain()
  )
}

function _configure (argv) {
  let opts = {
    rate: argv.rate || -1,
    size: argv.size || -1,
    seed: argv.seed || Math.random()
  }

  if (opts.size > 0) {
    // TODO: How to do this with globbing? Do we pre-expand? Blech.
    opts.rate = opts.size / fs.readdirSync(argv._[0]).length
  }

  return opts
}

function sampleFiles (argv) {
  let opts = _configure(argv)
  let files
  if (argv._.length > 2) {
    files = pull.values(argv._.slice(0, argv._.length - 1))
  } else {
    files = walkFiles(argv._[0])
  }

  let loop = Pushable()
  let output = Pushable()

  pull(
    cat([files, loop]),
    sample(opts, output),
    pull.drain(function (ea) {
      // If size is set and not rate, then we may have to loop over the collection.
      if (opts.size > 0) {
        loop.push(ea)
      }
    })
  )

  return output
}

function sample (opts, output) {
  let random = new Alea(opts.seed)
  let stopper = Abortable()
  let kill = stopper.abort
  let total = 0

  return pull(
    stopper,
    pull.filter(function (ea) {
      if (random() < opts.rate) {
        total++
        output.push(ea)
        if (opts.size > 0 && total >= opts.size) {
          kill()
        }
        return false
      }
      return true
    })
  )
}

function walkFiles (dir) {
  if (dir.match(/\*/)) {
    throw new Error('Feature Disabled: Globbing makes size flag work poorly :( .')
    // return glob(dir)
  }
  // TODO: Assumes they gave a directory. This is clearly wrong.

  return glob(dir + '/*')
}

function xor (a, b) {
  return !((a && b) || !(a || b))
}
