var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [7, 100]
      }
    }
  }, {
    hooks: {
      beforeValidate: function(user, options) {
        if (typeof user.email === 'string') {
          user.email = user.email.toLowerCase();
        }
      }
    },
    classMethods: {
      authenticate: function(body) {
        return new Promise(function(resolve, reject) {
          if (typeof body.email !== 'string' || typeof body.password !== 'string') {
            return reject();
          }
          user.findOne({
            where: {
              email: body.email
            }
          }).then(function(user) {
            if (!user || user.password !== body.password) {
              return reject();
            }
            resolve(user);
          }, function(e) {
            reject();
          });
        });
      }
    },
    instanceMethods: {
      toPublicJSON: function() {
        var json = this.toJSON();
        return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
      },
      generatedToken: function(type) {
        if (!_.isString(type)) {
          return undefined;
        }
        try {
          var stringData = JSON.stringify({
            id: this.get('id'),
            type: type
          });
          var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#!').toString();
          var token = jwt.sign({
            token: encryptedData
          }, 'qwerty098');
          return token;
        } catch (e) {
          return undefined;
        }
      }
    }
  });
  return user;
};