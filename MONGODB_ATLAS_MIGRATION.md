# MongoDB Atlas Migration Guide

This guide will help you migrate your QuickExam application from local MongoDB to MongoDB Atlas (cloud database).

## Table of Contents
1. [Create MongoDB Atlas Account](#step-1-create-mongodb-atlas-account)
2. [Set Up Your Cluster](#step-2-set-up-your-cluster)
3. [Configure Database Access](#step-3-configure-database-access)
4. [Configure Network Access](#step-4-configure-network-access)
5. [Get Connection String](#step-5-get-connection-string)
6. [Update Your Application](#step-6-update-your-application)
7. [Migrate Existing Data (Optional)](#step-7-migrate-existing-data-optional)
8. [Test the Connection](#step-8-test-the-connection)
9. [Troubleshooting](#troubleshooting)

---

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas Registration](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with your email or use Google/GitHub authentication
3. Complete the registration process

## Step 2: Set Up Your Cluster

1. After logging in, click **"Build a Cluster"** or **"Create"**
2. Choose **M0 FREE** tier (perfect for development and small applications)
   - 512 MB storage
   - Shared RAM
   - No credit card required
3. Select your preferred cloud provider:
   - **AWS** (Amazon Web Services)
   - **Google Cloud**
   - **Azure**
4. Choose a **region** closest to you or your users for better performance
5. Give your cluster a name (e.g., `QuickExamCluster`)
6. Click **"Create Cluster"** (takes 3-5 minutes to provision)

## Step 3: Configure Database Access

1. In the left sidebar, click **"Database Access"** (under Security)
2. Click **"Add New Database User"**
3. Select **"Password"** as authentication method
4. Create credentials:
   - **Username**: Choose a username (e.g., `quickexam-user`)
   - **Password**: Generate a secure password or create your own
   - **IMPORTANT**: Save these credentials securely - you'll need them later!
5. Set **Database User Privileges** to:
   - Built-in Role: **"Read and write to any database"**
6. Click **"Add User"**

## Step 4: Configure Network Access

1. In the left sidebar, click **"Network Access"** (under Security)
2. Click **"Add IP Address"**
3. Choose one of the following options:

   **Option A: Allow from Anywhere (Development)**
   - Click **"Allow Access from Anywhere"**
   - IP Address: `0.0.0.0/0`
   - ⚠️ Warning: Only use this for development/testing

   **Option B: Add Your Current IP (Recommended for Production)**
   - Click **"Add Current IP Address"**
   - Your IP will be automatically detected

4. Click **"Confirm"**
5. Wait for the status to change to **"Active"** (takes 1-2 minutes)

## Step 5: Get Connection String

1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Select:
   - **Driver**: Node.js
   - **Version**: 4.1 or later
5. Copy the connection string - it will look like this:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Important Notes**:
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - Keep the connection string secure - never commit it to Git!

## Step 6: Update Your Application

### 6.1 Update .env File

1. Open your `.env` file in the project root
2. Update the `MONGODB_URI` variable:

   **Before (Local MongoDB):**
   ```env
   MONGODB_URI=mongodb://localhost:27017/quickexam
   ```

   **After (MongoDB Atlas):**
   ```env
   MONGODB_URI=mongodb+srv://quickexam-user:YourPassword123@cluster0.xxxxx.mongodb.net/quickexam?retryWrites=true&w=majority
   ```

   **Example with actual values:**
   ```env
   MONGODB_URI=mongodb+srv://quickexam-user:MySecurePass123@cluster0.abc123.mongodb.net/quickexam?retryWrites=true&w=majority
   ```

### 6.2 Important Connection String Tips

- Make sure to replace `<username>` and `<password>` with your actual credentials
- If your password contains special characters (`@`, `:`, `/`, `?`, `#`, `[`, `]`, `%`), you need to URL-encode them:
  - `@` becomes `%40`
  - `:` becomes `%3A`
  - `/` becomes `%2F`
  - `?` becomes `%3F`
  - Use this tool: https://www.urlencoder.org/
- Add the database name (`quickexam`) after the cluster URL
- Keep the connection string parameters (`retryWrites=true&w=majority`)

### 6.3 Restart Your Server

After updating the `.env` file:

1. Stop your current server (Ctrl+C)
2. Restart the server:
   ```bash
   npm run server
   ```
3. You should see: `MongoDB connected successfully to Atlas` in the console

## Step 7: Migrate Existing Data (Optional)

If you have existing data in your local MongoDB that you want to migrate to Atlas:

### Option A: Using MongoDB Compass (GUI - Recommended)

1. **Download MongoDB Compass**: https://www.mongodb.com/try/download/compass
2. **Connect to your LOCAL database**:
   - Connection string: `mongodb://localhost:27017`
   - Click "Connect"
3. **Export your data**:
   - Select the `quickexam` database
   - For each collection (quizzes, students, examsessions):
     - Click on the collection
     - Click "Export Collection"
     - Choose JSON format
     - Save the file
4. **Connect to MongoDB Atlas**:
   - Disconnect from local
   - Use your Atlas connection string
   - Click "Connect"
5. **Import your data**:
   - Create the `quickexam` database (if not exists)
   - For each collection:
     - Create the collection
     - Click "Import Data"
     - Select the JSON file you exported
     - Click "Import"

### Option B: Using mongodump and mongorestore (Command Line)

1. **Export from local MongoDB**:
   ```bash
   mongodump --uri="mongodb://localhost:27017/quickexam" --out=./backup
   ```

2. **Import to MongoDB Atlas**:
   ```bash
   mongorestore --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/quickexam" ./backup/quickexam
   ```

   Replace the connection string with your actual Atlas connection string.

### Option C: Start Fresh (No Migration)

If you don't have important data, you can simply:
- Switch to Atlas connection string
- Your application will create new collections automatically
- You can create test exams from scratch

## Step 8: Test the Connection

1. **Restart your server**:
   ```bash
   npm run server
   ```

2. **Look for success messages** in the console:
   ```
   MongoDB connected successfully
   Server running on port 3001
   ```

3. **Test the application**:
   - Open the teacher portal: http://localhost:5173/teacher
   - Create a test exam
   - Check if it saves successfully
   - View it in MongoDB Atlas:
     - Go to Atlas dashboard
     - Click "Browse Collections"
     - You should see your `quickexam` database and `quizzes` collection

4. **Verify in MongoDB Atlas**:
   - Go to your Atlas cluster
   - Click **"Browse Collections"**
   - You should see:
     - Database: `quickexam`
     - Collections: `quizzes`, `students`, `examsessions`
   - Click on any collection to view the data

## Troubleshooting

### Error: "MongoServerError: bad auth"
**Solution**: Your username or password is incorrect
- Double-check your credentials in Atlas
- Make sure special characters are URL-encoded
- Verify the username matches exactly (case-sensitive)

### Error: "MongooseServerSelectionError: connect ECONNREFUSED"
**Solution**: Network access not configured
- Go to Network Access in Atlas
- Make sure your IP is whitelisted
- Try allowing access from anywhere (0.0.0.0/0) for testing

### Error: "MongooseServerSelectionError: getaddrinfo ENOTFOUND"
**Solution**: Connection string is incorrect
- Verify your connection string format
- Make sure you replaced `<username>` and `<password>`
- Check that cluster URL is correct

### Error: "Authentication failed"
**Solution**: Database user doesn't have correct permissions
- Go to Database Access in Atlas
- Edit your user
- Ensure "Read and write to any database" permission is set

### Connection is slow
**Solution**: Choose a closer region
- Atlas free tier may have some latency
- Consider upgrading to a paid tier for better performance
- Choose a region geographically closer to your users

### Data not showing up
**Solution**: Check database name
- Make sure `/quickexam` is in your connection string
- Verify the database name in your models matches
- Check in Atlas "Browse Collections" for the correct database

## Benefits of MongoDB Atlas

✅ **Always Available**: Your database runs 24/7 in the cloud
✅ **Automatic Backups**: Daily backups included in free tier
✅ **Scalable**: Easy to upgrade as your app grows
✅ **Secure**: Built-in security features and encryption
✅ **Monitoring**: Performance metrics and alerts
✅ **Global**: Deploy in multiple regions worldwide
✅ **No Maintenance**: MongoDB handles all infrastructure

## Next Steps

After successfully migrating:

1. **Test thoroughly**: Create exams, take tests, view results
2. **Monitor usage**: Check Atlas dashboard for metrics
3. **Set up alerts**: Configure email alerts for issues
4. **Review security**: Ensure proper IP whitelisting
5. **Consider backups**: Set up automated backup schedule
6. **Deploy your app**: Now you can deploy to Heroku, Vercel, etc.

## Security Best Practices

🔒 **Never commit `.env` to Git**
- `.env` is already in `.gitignore`
- Never share your connection string publicly

🔒 **Use strong passwords**
- Minimum 12 characters
- Mix of letters, numbers, symbols

🔒 **Restrict IP access in production**
- Only whitelist your server's IP
- Don't use 0.0.0.0/0 in production

🔒 **Rotate credentials regularly**
- Change passwords every 90 days
- Update connection string in .env

## Support

If you need help:
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- MongoDB University (Free courses): https://university.mongodb.com/
- Community Forums: https://www.mongodb.com/community/forums/

---

**Congratulations!** Your QuickExam application is now using MongoDB Atlas cloud database! 🎉
