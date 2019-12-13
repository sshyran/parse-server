"use strict";

// Apple SignIn Auth
// https://developer.apple.com/documentation/signinwithapplerestapi
const Parse = require('parse/node').Parse;

const httpsRequest = require('./httpsRequest');

const NodeRSA = require('node-rsa');

const jwt = require('jsonwebtoken');

const TOKEN_ISSUER = 'https://appleid.apple.com';
let currentKey;

const getApplePublicKey = async () => {
  let data;

  try {
    data = await httpsRequest.get('https://appleid.apple.com/auth/keys');
  } catch (e) {
    if (currentKey) {
      return currentKey;
    }

    throw e;
  }

  const key = data.keys[0];
  const pubKey = new NodeRSA();
  pubKey.importKey({
    n: Buffer.from(key.n, 'base64'),
    e: Buffer.from(key.e, 'base64')
  }, 'components-public');
  currentKey = pubKey.exportKey(['public']);
  return currentKey;
};

const verifyIdToken = async ({
  token,
  id
}, clientID) => {
  if (!token) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'id token is invalid for this user.');
  }

  const applePublicKey = await getApplePublicKey();
  const jwtClaims = jwt.verify(token, applePublicKey, {
    algorithms: 'RS256'
  });

  if (jwtClaims.iss !== TOKEN_ISSUER) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `id token not issued by correct OpenID provider - expected: ${TOKEN_ISSUER} | from: ${jwtClaims.iss}`);
  }

  if (jwtClaims.sub !== id) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `auth data is invalid for this user.`);
  }

  if (clientID !== undefined && jwtClaims.aud !== clientID) {
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, `jwt aud parameter does not include this client - is: ${jwtClaims.aud} | expected: ${clientID}`);
  }

  return jwtClaims;
}; // Returns a promise that fulfills if this id token is valid


function validateAuthData(authData, options = {}) {
  return verifyIdToken(authData, options.client_id);
} // Returns a promise that fulfills if this app id is valid.


function validateAppId() {
  return Promise.resolve();
}

module.exports = {
  validateAppId,
  validateAuthData
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9BZGFwdGVycy9BdXRoL2FwcGxlLmpzIl0sIm5hbWVzIjpbIlBhcnNlIiwicmVxdWlyZSIsImh0dHBzUmVxdWVzdCIsIk5vZGVSU0EiLCJqd3QiLCJUT0tFTl9JU1NVRVIiLCJjdXJyZW50S2V5IiwiZ2V0QXBwbGVQdWJsaWNLZXkiLCJkYXRhIiwiZ2V0IiwiZSIsImtleSIsImtleXMiLCJwdWJLZXkiLCJpbXBvcnRLZXkiLCJuIiwiQnVmZmVyIiwiZnJvbSIsImV4cG9ydEtleSIsInZlcmlmeUlkVG9rZW4iLCJ0b2tlbiIsImlkIiwiY2xpZW50SUQiLCJFcnJvciIsIk9CSkVDVF9OT1RfRk9VTkQiLCJhcHBsZVB1YmxpY0tleSIsImp3dENsYWltcyIsInZlcmlmeSIsImFsZ29yaXRobXMiLCJpc3MiLCJzdWIiLCJ1bmRlZmluZWQiLCJhdWQiLCJ2YWxpZGF0ZUF1dGhEYXRhIiwiYXV0aERhdGEiLCJvcHRpb25zIiwiY2xpZW50X2lkIiwidmFsaWRhdGVBcHBJZCIsIlByb21pc2UiLCJyZXNvbHZlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBRUEsTUFBTUEsS0FBSyxHQUFHQyxPQUFPLENBQUMsWUFBRCxDQUFQLENBQXNCRCxLQUFwQzs7QUFDQSxNQUFNRSxZQUFZLEdBQUdELE9BQU8sQ0FBQyxnQkFBRCxDQUE1Qjs7QUFDQSxNQUFNRSxPQUFPLEdBQUdGLE9BQU8sQ0FBQyxVQUFELENBQXZCOztBQUNBLE1BQU1HLEdBQUcsR0FBR0gsT0FBTyxDQUFDLGNBQUQsQ0FBbkI7O0FBRUEsTUFBTUksWUFBWSxHQUFHLDJCQUFyQjtBQUVBLElBQUlDLFVBQUo7O0FBRUEsTUFBTUMsaUJBQWlCLEdBQUcsWUFBWTtBQUNwQyxNQUFJQyxJQUFKOztBQUNBLE1BQUk7QUFDRkEsSUFBQUEsSUFBSSxHQUFHLE1BQU1OLFlBQVksQ0FBQ08sR0FBYixDQUFpQixxQ0FBakIsQ0FBYjtBQUNELEdBRkQsQ0FFRSxPQUFPQyxDQUFQLEVBQVU7QUFDVixRQUFJSixVQUFKLEVBQWdCO0FBQ2QsYUFBT0EsVUFBUDtBQUNEOztBQUNELFVBQU1JLENBQU47QUFDRDs7QUFFRCxRQUFNQyxHQUFHLEdBQUdILElBQUksQ0FBQ0ksSUFBTCxDQUFVLENBQVYsQ0FBWjtBQUVBLFFBQU1DLE1BQU0sR0FBRyxJQUFJVixPQUFKLEVBQWY7QUFDQVUsRUFBQUEsTUFBTSxDQUFDQyxTQUFQLENBQ0U7QUFBRUMsSUFBQUEsQ0FBQyxFQUFFQyxNQUFNLENBQUNDLElBQVAsQ0FBWU4sR0FBRyxDQUFDSSxDQUFoQixFQUFtQixRQUFuQixDQUFMO0FBQW1DTCxJQUFBQSxDQUFDLEVBQUVNLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZTixHQUFHLENBQUNELENBQWhCLEVBQW1CLFFBQW5CO0FBQXRDLEdBREYsRUFFRSxtQkFGRjtBQUlBSixFQUFBQSxVQUFVLEdBQUdPLE1BQU0sQ0FBQ0ssU0FBUCxDQUFpQixDQUFDLFFBQUQsQ0FBakIsQ0FBYjtBQUNBLFNBQU9aLFVBQVA7QUFDRCxDQXBCRDs7QUFzQkEsTUFBTWEsYUFBYSxHQUFHLE9BQU87QUFBRUMsRUFBQUEsS0FBRjtBQUFTQyxFQUFBQTtBQUFULENBQVAsRUFBc0JDLFFBQXRCLEtBQW1DO0FBQ3ZELE1BQUksQ0FBQ0YsS0FBTCxFQUFZO0FBQ1YsVUFBTSxJQUFJcEIsS0FBSyxDQUFDdUIsS0FBVixDQUNKdkIsS0FBSyxDQUFDdUIsS0FBTixDQUFZQyxnQkFEUixFQUVKLG9DQUZJLENBQU47QUFJRDs7QUFDRCxRQUFNQyxjQUFjLEdBQUcsTUFBTWxCLGlCQUFpQixFQUE5QztBQUNBLFFBQU1tQixTQUFTLEdBQUd0QixHQUFHLENBQUN1QixNQUFKLENBQVdQLEtBQVgsRUFBa0JLLGNBQWxCLEVBQWtDO0FBQUVHLElBQUFBLFVBQVUsRUFBRTtBQUFkLEdBQWxDLENBQWxCOztBQUVBLE1BQUlGLFNBQVMsQ0FBQ0csR0FBVixLQUFrQnhCLFlBQXRCLEVBQW9DO0FBQ2xDLFVBQU0sSUFBSUwsS0FBSyxDQUFDdUIsS0FBVixDQUNKdkIsS0FBSyxDQUFDdUIsS0FBTixDQUFZQyxnQkFEUixFQUVILDhEQUE2RG5CLFlBQWEsWUFBV3FCLFNBQVMsQ0FBQ0csR0FBSSxFQUZoRyxDQUFOO0FBSUQ7O0FBQ0QsTUFBSUgsU0FBUyxDQUFDSSxHQUFWLEtBQWtCVCxFQUF0QixFQUEwQjtBQUN4QixVQUFNLElBQUlyQixLQUFLLENBQUN1QixLQUFWLENBQ0p2QixLQUFLLENBQUN1QixLQUFOLENBQVlDLGdCQURSLEVBRUgscUNBRkcsQ0FBTjtBQUlEOztBQUNELE1BQUlGLFFBQVEsS0FBS1MsU0FBYixJQUEwQkwsU0FBUyxDQUFDTSxHQUFWLEtBQWtCVixRQUFoRCxFQUEwRDtBQUN4RCxVQUFNLElBQUl0QixLQUFLLENBQUN1QixLQUFWLENBQ0p2QixLQUFLLENBQUN1QixLQUFOLENBQVlDLGdCQURSLEVBRUgsd0RBQXVERSxTQUFTLENBQUNNLEdBQUksZ0JBQWVWLFFBQVMsRUFGMUYsQ0FBTjtBQUlEOztBQUNELFNBQU9JLFNBQVA7QUFDRCxDQTdCRCxDLENBK0JBOzs7QUFDQSxTQUFTTyxnQkFBVCxDQUEwQkMsUUFBMUIsRUFBb0NDLE9BQU8sR0FBRyxFQUE5QyxFQUFrRDtBQUNoRCxTQUFPaEIsYUFBYSxDQUFDZSxRQUFELEVBQVdDLE9BQU8sQ0FBQ0MsU0FBbkIsQ0FBcEI7QUFDRCxDLENBRUQ7OztBQUNBLFNBQVNDLGFBQVQsR0FBeUI7QUFDdkIsU0FBT0MsT0FBTyxDQUFDQyxPQUFSLEVBQVA7QUFDRDs7QUFFREMsTUFBTSxDQUFDQyxPQUFQLEdBQWlCO0FBQ2ZKLEVBQUFBLGFBRGU7QUFFZkosRUFBQUE7QUFGZSxDQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIEFwcGxlIFNpZ25JbiBBdXRoXG4vLyBodHRwczovL2RldmVsb3Blci5hcHBsZS5jb20vZG9jdW1lbnRhdGlvbi9zaWduaW53aXRoYXBwbGVyZXN0YXBpXG5cbmNvbnN0IFBhcnNlID0gcmVxdWlyZSgncGFyc2Uvbm9kZScpLlBhcnNlO1xuY29uc3QgaHR0cHNSZXF1ZXN0ID0gcmVxdWlyZSgnLi9odHRwc1JlcXVlc3QnKTtcbmNvbnN0IE5vZGVSU0EgPSByZXF1aXJlKCdub2RlLXJzYScpO1xuY29uc3Qgand0ID0gcmVxdWlyZSgnanNvbndlYnRva2VuJyk7XG5cbmNvbnN0IFRPS0VOX0lTU1VFUiA9ICdodHRwczovL2FwcGxlaWQuYXBwbGUuY29tJztcblxubGV0IGN1cnJlbnRLZXk7XG5cbmNvbnN0IGdldEFwcGxlUHVibGljS2V5ID0gYXN5bmMgKCkgPT4ge1xuICBsZXQgZGF0YTtcbiAgdHJ5IHtcbiAgICBkYXRhID0gYXdhaXQgaHR0cHNSZXF1ZXN0LmdldCgnaHR0cHM6Ly9hcHBsZWlkLmFwcGxlLmNvbS9hdXRoL2tleXMnKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChjdXJyZW50S2V5KSB7XG4gICAgICByZXR1cm4gY3VycmVudEtleTtcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfVxuXG4gIGNvbnN0IGtleSA9IGRhdGEua2V5c1swXTtcblxuICBjb25zdCBwdWJLZXkgPSBuZXcgTm9kZVJTQSgpO1xuICBwdWJLZXkuaW1wb3J0S2V5KFxuICAgIHsgbjogQnVmZmVyLmZyb20oa2V5Lm4sICdiYXNlNjQnKSwgZTogQnVmZmVyLmZyb20oa2V5LmUsICdiYXNlNjQnKSB9LFxuICAgICdjb21wb25lbnRzLXB1YmxpYydcbiAgKTtcbiAgY3VycmVudEtleSA9IHB1YktleS5leHBvcnRLZXkoWydwdWJsaWMnXSk7XG4gIHJldHVybiBjdXJyZW50S2V5O1xufTtcblxuY29uc3QgdmVyaWZ5SWRUb2tlbiA9IGFzeW5jICh7IHRva2VuLCBpZCB9LCBjbGllbnRJRCkgPT4ge1xuICBpZiAoIXRva2VuKSB7XG4gICAgdGhyb3cgbmV3IFBhcnNlLkVycm9yKFxuICAgICAgUGFyc2UuRXJyb3IuT0JKRUNUX05PVF9GT1VORCxcbiAgICAgICdpZCB0b2tlbiBpcyBpbnZhbGlkIGZvciB0aGlzIHVzZXIuJ1xuICAgICk7XG4gIH1cbiAgY29uc3QgYXBwbGVQdWJsaWNLZXkgPSBhd2FpdCBnZXRBcHBsZVB1YmxpY0tleSgpO1xuICBjb25zdCBqd3RDbGFpbXMgPSBqd3QudmVyaWZ5KHRva2VuLCBhcHBsZVB1YmxpY0tleSwgeyBhbGdvcml0aG1zOiAnUlMyNTYnIH0pO1xuXG4gIGlmIChqd3RDbGFpbXMuaXNzICE9PSBUT0tFTl9JU1NVRVIpIHtcbiAgICB0aHJvdyBuZXcgUGFyc2UuRXJyb3IoXG4gICAgICBQYXJzZS5FcnJvci5PQkpFQ1RfTk9UX0ZPVU5ELFxuICAgICAgYGlkIHRva2VuIG5vdCBpc3N1ZWQgYnkgY29ycmVjdCBPcGVuSUQgcHJvdmlkZXIgLSBleHBlY3RlZDogJHtUT0tFTl9JU1NVRVJ9IHwgZnJvbTogJHtqd3RDbGFpbXMuaXNzfWBcbiAgICApO1xuICB9XG4gIGlmIChqd3RDbGFpbXMuc3ViICE9PSBpZCkge1xuICAgIHRocm93IG5ldyBQYXJzZS5FcnJvcihcbiAgICAgIFBhcnNlLkVycm9yLk9CSkVDVF9OT1RfRk9VTkQsXG4gICAgICBgYXV0aCBkYXRhIGlzIGludmFsaWQgZm9yIHRoaXMgdXNlci5gXG4gICAgKTtcbiAgfVxuICBpZiAoY2xpZW50SUQgIT09IHVuZGVmaW5lZCAmJiBqd3RDbGFpbXMuYXVkICE9PSBjbGllbnRJRCkge1xuICAgIHRocm93IG5ldyBQYXJzZS5FcnJvcihcbiAgICAgIFBhcnNlLkVycm9yLk9CSkVDVF9OT1RfRk9VTkQsXG4gICAgICBgand0IGF1ZCBwYXJhbWV0ZXIgZG9lcyBub3QgaW5jbHVkZSB0aGlzIGNsaWVudCAtIGlzOiAke2p3dENsYWltcy5hdWR9IHwgZXhwZWN0ZWQ6ICR7Y2xpZW50SUR9YFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIGp3dENsYWltcztcbn07XG5cbi8vIFJldHVybnMgYSBwcm9taXNlIHRoYXQgZnVsZmlsbHMgaWYgdGhpcyBpZCB0b2tlbiBpcyB2YWxpZFxuZnVuY3Rpb24gdmFsaWRhdGVBdXRoRGF0YShhdXRoRGF0YSwgb3B0aW9ucyA9IHt9KSB7XG4gIHJldHVybiB2ZXJpZnlJZFRva2VuKGF1dGhEYXRhLCBvcHRpb25zLmNsaWVudF9pZCk7XG59XG5cbi8vIFJldHVybnMgYSBwcm9taXNlIHRoYXQgZnVsZmlsbHMgaWYgdGhpcyBhcHAgaWQgaXMgdmFsaWQuXG5mdW5jdGlvbiB2YWxpZGF0ZUFwcElkKCkge1xuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB2YWxpZGF0ZUFwcElkLFxuICB2YWxpZGF0ZUF1dGhEYXRhLFxufTtcbiJdfQ==