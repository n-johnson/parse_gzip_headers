#!/usr/bin/env node

const gzip_magic = '1f8b'

const equals          = (a, b) => a === b
const isGzipMagic     = (x)    => equals(String(x), gzip_magic)
const isGzip          = (b)    => isGzipMagic(b.hexSlice(0, 2))
const isNumber        = (n)    => typeof n === 'number'
const isValidUnixtime = (n)    => isNumber(n) && (n > 0)

const unixtimeToDateMaybe = (t) => isValidUnixtime(t) 
  ? new Date(t * 1000)
  : new Date(0)

const getGzipCompressionType = (n) => {
  switch(n) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7: return 'reserved'
    case 8: return 'deflate'
    default: return 'INVALID'
  }
}

const getGzipCompressionFlag = (n) => {
  switch(n) {
    case 0: return 'unknown'
    case 2: return 'max compression, slowest algorithm'
    case 4: return 'fastest algorithm'
    default: return 'INVALID'
  }
}

const getGzipOSType = (n) => {
  switch(n) {
    case 0: return 'FAT filesystem (MS-DOS, OS/2, NT/Win32)'
    case 1: return 'Amiga'
    case 2: return 'VMS (or OpenVMS)'
    case 3: return 'Unix'
    case 4: return 'VM/CMS'
    case 5: return 'Atari TOS'
    case 6: return 'HPFS filesystem (OS/2, NT)'
    case 7: return 'Macintosh'
    case 8: return 'Z-System'
    case 9: return 'CP/M'
    case 10: return 'TOPS-20'
    case 11: return 'NTFS filesystem (NT)'
    case 12: return 'QDOS'
    case 13: return 'Acorn RISCOS'
    case 255: return 'unknown'
    default: return 'INVALID'
  }
}

const _read = (b, n) => {
  switch (n) {
    case 1: return (p) => b.readUInt8(p); 
    case 2: return (p) => b.readUInt16LE(p);
    case 4: return (p) => b.readUInt32LE(p);
    default: throw new Error('Invalid byte length')
  }
}
const readByte = (n, p) => (b) => _read(b, n)(p)

const header_compression   = readByte(1, 2)
const header_flags         = readByte(1, 3)
const header_last_modified = readByte(4, 4) 
const header_extra_flags   = readByte(1, 8)
const header_os            = readByte(1, 9)

const parseGzipHeader = (b) => isGzip(b)
    ? _parseGzipHeader(b)
    : new Error('Not valid gzip data')
const _parseGzipHeader = (b) => {
  return {
      compression:   getGzipCompressionType(header_compression(b)),
      flags:         header_flags(b),
      last_modified: unixtimeToDateMaybe(header_last_modified(b)),
      extra_flags:   getGzipCompressionFlag(header_extra_flags(b)),
      os:            getGzipOSType(header_os(b))
    }
  }

var inputBufferList = [];
process.stdin.resume();
process.stdin.on('data', buffer => inputBufferList.push(buffer));
process.stdin.on('end', () => console.log(parseGzipHeader(Buffer.concat(inputBufferList))));
