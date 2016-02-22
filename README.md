# parse_gzip_headers

Examples:

```
$ curl https://www.reddit.com -H "Accept-Encoding: gzip,deflate" -s | node parse_gzip_header.js
{ compression: 'deflate',
  flags: 0,
  last_modified: Sun Feb 21 2016 20:01:28 GMT-0800 (PST),
  extra_flags: 'max compression, slowest algorithm',
  os: 'unknown' }
```

```
$ echo "TEST" | gzip | node parse_gzip_header.js
{ compression: 'deflate',
  flags: 0,
  last_modified: Sun Feb 21 2016 20:04:04 GMT-0800 (PST),
  extra_flags: 'unknown',
  os: 'Unix' }
```