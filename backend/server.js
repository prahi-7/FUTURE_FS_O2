const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const compression = require('compression');


// Middleware
app.use(cors());
app.use(express.json());

// Add after middleware section
app.use(compression()); // Compress responses

// ==================== BASIC TEST ROUTES ====================

app.get('/', (req, res) => {
  res.json({ message: 'LeadNest CRM Backend is running!', status: 'active' });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend running' });
});

// ==================== OPTIMIZED MONGODB ATLAS CONNECTION ====================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://p:p7@ac-rbm47nx-shard-00-00.rwnfwzo.mongodb.net:27017,ac-rbm47nx-shard-00-01.rwnfwzo.mongodb.net:27017,ac-rbm47nx-shard-00-02.rwnfwzo.mongodb.net:27017/?ssl=true&replicaSet=atlas-ajxob2-shard-0&authSource=admin&appName=Cluster2';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10, // Connection pool for faster responses
  minPoolSize: 2
})
.then(() => console.log('✅ MongoDB Atlas connected'))
.catch(err => console.log('❌ MongoDB error:', err.message));

// ==================== MODELS ====================

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, enum: ['admin', 'manager', 'rep'], default: 'rep' },
  createdAt: { type: Date, default: Date.now }
});

// Add index for faster queries
userSchema.index({ email: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

const leadSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  company: String,
  jobTitle: String,
  leadSource: { type: String, default: 'website' },
  status: { 
    type: String, 
    enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
    default: 'new' 
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  value: { type: Number, default: 0 },
  followUpDate: Date,
  notes: [{
    content: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for faster queries
leadSchema.index({ status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdAt: -1 });

const Lead = mongoose.model('Lead', leadSchema);

// ==================== MIDDLEWARE ====================

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, 'leadnest_secret_key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// ==================== AUTH ROUTES ====================

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const user = new User({ name, email, password, role: role || 'rep' });
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, 'leadnest_secret_key', { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, 'leadnest_secret_key', { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AUTO-FIX: Assign all unassigned leads to current user
app.post('/api/auth/fix-my-leads', authMiddleware, async (req, res) => {
  try {
    const result = await Lead.updateMany(
      { $or: [{ assignedTo: { $exists: false } }, { assignedTo: null }] },
      { $set: { assignedTo: req.userId } }
    );
    res.json({ 
      message: `Successfully assigned ${result.modifiedCount} leads to you`,
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, email, phone },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== LEAD ROUTES ====================

app.post('/api/leads', authMiddleware, async (req, res) => {
  try {
    const leadData = {
      ...req.body,
      assignedTo: req.userId
    };
    const lead = new Lead(leadData);
    await lead.save();
    
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leads', authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    
    const leads = await Lead.find(query).populate('assignedTo', 'name email').sort({ createdAt: -1 }).limit(100);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leads/:id', authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email');
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/leads/:id', authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('assignedTo', 'name email');
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/leads/:id', authMiddleware, async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ANALYTICS ROUTES (OPTIMIZED) ====================

app.get('/api/analytics/dashboard', authMiddleware, async (req, res) => {
  try {
    // Run queries in parallel for faster response
    const [totalLeads, convertedLeads, pipelineResult, leadsByStatus] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: 'won' }),
      Lead.aggregate([
        { $match: { status: { $nin: ['won', 'lost'] } } },
        { $group: { _id: null, total: { $sum: '$value' } } }
      ]),
      Lead.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$value' } } }
      ])
    ]);
    
    const pipelineValue = pipelineResult[0]?.total || 0;
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;
    
    res.json({
      totalLeads,
      convertedLeads,
      conversionRate: parseFloat(conversionRate),
      pipelineValue,
      leadsByStatus
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TEAM ROUTES ====================

app.get('/api/team/members', authMiddleware, async (req, res) => {
  try {
    const members = await User.find().select('-password').limit(50);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/team/performance', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('name email role').limit(50);
    
    const performance = await Promise.all(users.map(async (user) => {
      const leads = await Lead.find({ assignedTo: user._id }).limit(1000);
      const converted = leads.filter(l => l.status === 'won').length;
      const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
      
      return {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        stats: {
          totalLeads: leads.length,
          converted,
          conversionRate: leads.length ? ((converted / leads.length) * 100).toFixed(1) : 0,
          totalValue,
        },
      };
    }));
    
    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`\n🚀 ========================================`);
  console.log(`   LeadNest CRM Backend Running`);
  console.log(`   ========================================`);
  console.log(`   Server: http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   ========================================\n`);
});