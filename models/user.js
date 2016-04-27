module.exports = function(sequelize, DataTypes){
  var user = sequelize.define('user',{
    email:{
      type:DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate:{
        isEmail:true
      }
    },
    password:{
      type:DataTypes.STRING,
      allowNull: false,
      validate:{
        len:[7,100]
      }
    }
  },{
      hooks: {
        beforeValidate: function(user, options){
          if(typeof user.email === 'string') {
            user.email = user.email.toLowerCase();
          }
        }
      },
      classMethods:{
        authenticate: function(body){
          return new Promise(function(resolve,reject){
            if(typeof body.email !== 'string' || typeof body.password !== 'string'){
            	return reject();
            }
              user.findOne({
            	where:{
            		email:body.email
            	}
            }).then(function(user){
            	if(!user || user.password !== body.password){
            		return reject();
            	}
              resolve(user.toJSON());
            },function(e){
            	 reject();
            });
          });
        }
      },
      instanceMethods: {
        toPublicJSON: function(){
          var json = this.toJSON();
          return _.pick(json, 'id' , 'email','createdAt','updatedAt');
        }
      }
  });
  return user;
};
