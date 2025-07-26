const { db } = require('../firebase');
const collection = db.collection('layanan');

exports.getAllServices = async (req, res) => {
  const snapshot = await collection.get();
  const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(services);
};

exports.createService = async (req, res) => {
  const data = req.body;
  const docRef = await collection.add(data);
  res.json({ id: docRef.id });
};

exports.updateService = async (req, res) => {
  const { id } = req.params;
  await collection.doc(id).update(req.body);
  res.sendStatus(200);
};

exports.deleteService = async (req, res) => {
  const { id } = req.params;
  await collection.doc(id).delete();
  res.sendStatus(200);
};
