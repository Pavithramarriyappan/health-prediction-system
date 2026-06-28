const mongoose = require('mongoose');
const Patient = require('../models/Patient');

// Simple in-memory store for local development when MongoDB is unavailable
const inMemoryStore = {
  data: [],
  nextId() { return `${Date.now()}-${Math.floor(Math.random()*10000)}`; }
};

function computeAge(dob) {
  if (!dob) return null;
  const date = new Date(dob);
  const diff = Date.now() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function mapDocToPlain(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : { ...doc };
  o.age = computeAge(o.dob);
  return o;
}

async function list({ q, risk, page = 1, limit = 20, ownerId, isSuperAdmin = false }) {
  if (mongoose.connection.readyState === 1) {
    const filter = {};
    if (!isSuperAdmin) {
      filter.createdBy = ownerId;
    }
    if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }];
    if (risk) {
      if (risk === 'high') filter['remarks.possibleCondition'] = /High Risk/i;
      else if (risk === 'low') filter['remarks.possibleCondition'] = /Low Risk/i;
      else if (risk === 'normal') filter['remarks.possibleCondition'] = /Normal|No significant/i;
    }
    const docs = await Patient.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));
    const total = await Patient.countDocuments(filter);
    return { data: docs.map(mapDocToPlain), total };
  }

  // In-memory filtering
  let items = inMemoryStore.data.slice().reverse();
  if (!isSuperAdmin) {
    items = items.filter(i => String(i.createdBy) === String(ownerId));
  }
  if (q) {
    const pattern = new RegExp(q, 'i');
    items = items.filter(i => pattern.test(i.name) || pattern.test(i.email));
  }
  if (risk) {
    if (risk === 'high') items = items.filter(i => /High Risk/i.test(i.remarks?.possibleCondition || ''));
    else if (risk === 'low') items = items.filter(i => /Low Risk/i.test(i.remarks?.possibleCondition || ''));
    else if (risk === 'normal') items = items.filter(i => /Normal|No significant/i.test(i.remarks?.possibleCondition || ''));
  }
  const total = items.length;
  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit).map(i => ({ ...i, age: computeAge(i.dob) }));
  return { data: paged, total };
}

async function getById(id, ownerId, isSuperAdmin = false) {
  if (mongoose.connection.readyState === 1) {
    const doc = await Patient.findById(id);
    if (!doc) return null;
    if (!isSuperAdmin && String(doc.createdBy) !== String(ownerId)) return null;
    return mapDocToPlain(doc);
  }
  const found = inMemoryStore.data.find(i => String(i._id) === String(id) && (isSuperAdmin || String(i.createdBy) === String(ownerId)));
  return found ? { ...found, age: computeAge(found.dob) } : null;
}

async function create(payload) {
  if (mongoose.connection.readyState === 1) {
    const doc = await Patient.create(payload);
    return mapDocToPlain(doc);
  }
  const item = { ...payload };
  item._id = inMemoryStore.nextId();
  item.createdAt = new Date();
  inMemoryStore.data.push(item);
  return { ...item, age: computeAge(item.dob) };
}

async function update(id, payload, ownerId, isSuperAdmin = false) {
  if (mongoose.connection.readyState === 1) {
    const query = { _id: id };
    if (!isSuperAdmin) query.createdBy = ownerId;
    const updated = await Patient.findOneAndUpdate(query, payload, { new: true, runValidators: true });
    return mapDocToPlain(updated);
  }
  const idx = inMemoryStore.data.findIndex(i => String(i._id) === String(id) && (isSuperAdmin || String(i.createdBy) === String(ownerId)));
  if (idx === -1) return null;
  inMemoryStore.data[idx] = { ...inMemoryStore.data[idx], ...payload };
  return { ...inMemoryStore.data[idx], age: computeAge(inMemoryStore.data[idx].dob) };
}

async function remove(id, ownerId, isSuperAdmin = false) {
  if (mongoose.connection.readyState === 1) {
    const query = { _id: id };
    if (!isSuperAdmin) query.createdBy = ownerId;
    const deleted = await Patient.findOneAndDelete(query);
    return !!deleted;
  }
  const idx = inMemoryStore.data.findIndex(i => String(i._id) === String(id) && (isSuperAdmin || String(i.createdBy) === String(ownerId)));
  if (idx === -1) return false;
  inMemoryStore.data.splice(idx, 1);
  return true;
}

module.exports = { list, getById, create, update, remove };
