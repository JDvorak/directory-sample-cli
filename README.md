# directory-sample [![stability][0]][1]
[![downloads][8]][9] [![js-standard-style][10]][11]

CLI to sample from a directory. I had to make this because all the CLI tools I came across broke either because they couldn't handle an 8 million file directory, or because they didn't sample evenly. 


## Usage

The script is pretty simple. It takes a rate or a size, and will sample from a directory either copying or moving each sampled file to the target. If neither `move` nor `copy` is set, sampled filepaths are output to stdout.

```bash
$ node index.js --help
Usage: index.js [OPTIONS] DIRECTORY TARGET

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --seed     string to seed the random operation, if false: random seed
             [default: false]
  --rate     set sampling rate as a floating point number
  --size     set maximum sample size, if not set
  --move     move from directory to target                             [boolean]
  --copy     copy from directory to target                             [boolean]

Examples:
  index.js --rate 0.2 dataset sample        set sampling rate to be 0.2, and
                                            select roughly 20% of the files from
                                            dataset and copy them to sample,
                                            output to stdout
  index.js --size 50 --seed "dog" --copy    Dynamically set sampling rate to
  dataset sample                            take 50 files from the directory,
                                            with the seed of "dog"

```

## Installation
TBD

## License
[MIT](https://tldrlegal.com/license/mit-license)

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/directory-sample.svg?style=flat-square
[3]: https://npmjs.org/package/directory-sample
[4]: https://img.shields.io/travis/jdvorak/directory-sample/master.svg?style=flat-square
[5]: https://travis-ci.org/jdvorak/directory-sample
[6]: https://img.shields.io/codecov/c/github/jdvorak/directory-sample/master.svg?style=flat-square
[7]: https://codecov.io/github/jdvorak/directory-sample
[8]: http://img.shields.io/npm/dm/directory-sample.svg?style=flat-square
[9]: https://npmjs.org/package/directory-sample
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard
