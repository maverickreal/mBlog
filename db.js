const MongoClient = require('mongodb').MongoClient;

const uri = `mongodb://${process.env.DBHOST}:${process.env.DBPORT}/${process.env.DBNAME}`;

let client = new MongoClient(
  uri,
  { useNewUrlParser: true }
  ), db = null;

const init = async (flush=false) => {
  try {
    await client.connect();
    db = client.db(process.env.DBNAME);
    if(flush){
      await truncate();
    }
  } catch (error) {
    console.log(error);
  }
};

const verifyCredentials = async (email, password) => {
  let returnValue = false;
  try {
    const users = db.collection('users');
    const user = await users.findOne({ $or: [ {email}, {password} ] });
    if (user) {
      returnValue = true;
    }
  } catch (error) {
    console.log(error);
  }
  return returnValue;
};

const userExists = async (email, password) => {
  let returnValue={};
  try {
    const users = db.collection('users');
    const user = await users.findOne(
      { email, password },
      {projection: { name: 1, email: 1, userId: 1}});
    if (user) {
      delete user._id;
      returnValue = { user };
    } else {
      returnValue = { error: 'user could not be found' };
    }
  } catch (error) {
    returnValue = { error };
  }
  return returnValue;
};

const createUser = async (userId, name, email, password) => {
  let returnValue = {};
  try {
    const users = db.collection('users');
    await users.insertOne({ userId, name, email, password, blogs: [] });
    returnValue.user = { name, email, userId };
  } catch (error) {
    returnValue = { error };
  }
  return returnValue;
};

const getUserProfile = async userId => {
  let returnValue = {};
  try {
    const users = db.collection('users');
    const res = await users.findOne({userId}, {projection:{blogCount:{$size:'$blogs'}, _id:0, name:1, email:1}});
    if(!res){
      returnValue = { error: 'user not found to exist' };
    }
    else {
      returnValue.profile = res;
    }
  }
  catch (error) {
    console.log(error);
    returnValue = { error };
  }
  return returnValue;
}

const createBlog = async (blogId, userId, title, description) => {
  let returnValue = {};
  try {
    const blogs = db.collection('blogs'), users = db.collection('users');
    await blogs.insertOne({
          blogId, title, description, userId,
          createdAt: new Date()
    });
    await users.updateOne({ userId }, { $push: { blogs: blogId } });
    returnValue.blog = { blogId, title, description };
  }
  catch (error) {
    returnValue = { error };
  }
  return returnValue;
};

const deleteBlog = async (userId, blogId) => {
  try {
    const blogs = db.collection('blogs'), users=db.collection('users');
    const res = await blogs.findOne({ blogId, userId });
    if (!res) {
      return false;
    }
    await blogs.deleteOne({ blogId });
    await users.updateOne(
      { userId },
      { $pull: { blogs: blogId } }
    );
  }
  catch (error) {
    return false;
  }
  return true;
}

const updateBlog = async ( userId, blogId, data ) => {
  try{
    const blogs = db.collection('blogs');
    if(!data.title){
      delete data.title;
    }
    if(!data.desc){
      delete data.desc;
    }
    const res = await blogs.updateOne({ blogId, userId }, {$set: data});
    if(res.matchedCount!==1){
      return { error:'blog not found' };
    }
    else{
      return { blogId, ...data };
    }
  }
  catch(error){
    return { error };
  }
}

const getBlog = async blogId => {
  let returnValue = {};
  try {
    const blogs = db.collection('blogs');
    const blog = await blogs.findOne({ blogId }, {projection: {userId: 0}});
    if (!blog) {
      returnValue = { error: 'blog not found' };
    }
    else {
      delete blog._id;
      returnValue = { blog };
    }
  }
  catch (error) {
    returnValue = { error };
  }
  return returnValue;
}

const getBlogsOfUser = async userId => {
  let returnValue = {};
  try {
    const users = db.collection('users'), blogs = db.collection('blogs');
    const user = await users.findOne({ userId });
    if (!user) {
      returnValue = { error: 'user could not be found' };
    }
    else {
      const blogsList = blogs.find({ userId }, {projection:{title: 1, description: 1, blogId: 1, createdAt: 1}});
      returnValue = { blogs: [] };
      for await ( const blog of blogsList){
        delete blog._id;
        returnValue.blogs.push(blog);
      }
    }
  }
  catch (error) {
    console.log(error);
    returnValue = { error };
  }
  return returnValue;
}

const truncate = async () => {
  try{
    await db.collection('users').drop();
    await db.collection('blogs').drop();
  }
  catch(error){
    console.log(error);
  }
}

module.exports={ init, verifyCredentials, userExists,
                 createBlog, createUser, deleteBlog,
                 getBlog, getBlogsOfUser, getUserProfile,
                 updateBlog
               };