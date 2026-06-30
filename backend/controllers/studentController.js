const Student = require("../models/studentModel");
const Room = require("../models/roomModel");
const User = require("../models/userModel");
const Hostel = require("../models/hostelModel");
const { asyncHandler } = require("../middleware/errorMiddleware");

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
const getStudents = asyncHandler(async (req, res) => {
    const students = await Student.find({})
        .populate("user", "name email")
        .populate({
            path: "room",
            select: "roomNumber boardingFee",
            populate: {
                path: "hostel",
                select: "name",
            },
        }).sort({ createdAt: -1 });
  res.status(200).json(students);
});

// @desc    Register a student (Admission)
// @route   POST /api/students
// @access  Private
// const registerStudent = asyncHandler(async (req, res) => {
//     console.log('Registering student:', req.body);
//     const { name, fatherName, boardingNumber, email, password, program, department, contact, parentContact, roomNumber, hostelName, year } = req.body;

//     if (!name || !fatherName || !boardingNumber || !password || !program || !department || !contact || !parentContact || !year) {
//         console.log('Missing fields:', { name, fatherName, boardingNumber, password, program, department, contact, parentContact, year });
//         res.status(400);
//         throw new Error('Please add all fields');
//     }

//     // Check if user/student already exists
//     const userExists = await User.findOne({ boardingNumber });
//     if (userExists) {
//         res.status(400);
//         throw new Error('Student with this college number already exists');
//     }

//     let roomId = null;
//     if (roomNumber && hostelName) {
//         const hostel = await Hostel.findOne({ name: hostelName });
//         if (!hostel) {
//             console.log('Hostel not found:', hostelName);
//             res.status(400);
//             throw new Error('Hostel not found');
//         }

//         const room = await Room.findOne({ roomNumber, hostel: hostel._id });
//         if (!room) {
//             console.log('Room not found:', { roomNumber, hostelId: hostel._id });
//             res.status(400);
//             throw new Error('Room not found in this hostel');
//         }
//         if (room.currentOccupants >= room.capacity) {
//             res.status(400);
//             throw new Error('Room is already full');
//         }
//         roomId = room._id;

//         // Update room occupancy
//         room.currentOccupants += 1;
//         if (room.currentOccupants >= room.capacity) {
//             room.status = 'Full';
//         }
//         await room.save();
//     }

//     // Create User first
//     const user = await User.create({
//         name,
//         boardingNumber,
//         email: email && email.trim() !== '' ? email : undefined,
//         password,
//         isAdmin: false,
//         role: 'student'
//     });

//     if (!user) {
//         res.status(400);
//         throw new Error('Error creating student user account');
//     }

//     // Create Student profile
//     const student = await Student.create({
//         user: user._id,
//         boardingNumber,
//         fatherName,
//         program,
//         department,
//         contact,
//         parentContact,
//         room: roomId,
//         hostel: roomId ? await Room.findById(roomId).then(r => r?.hostel) : null,
//         year,
//         password // Keep plain version in student record for admin reference
//     });

//     // Add student to room occupants if assigned
//     if (roomId) {
//         const room = await Room.findById(roomId);
//         if (room) {
//             room.occupants.push(student._id);
//             await room.save();
//         }
//     }

//     const populatedStudent = await Student.findById(student._id)
//         .populate('user', 'name email boardingNumber')
//         .populate({
//             path: 'room',
//             select: 'roomNumber',
//             populate: {
//                 path: 'hostel',
//                 select: 'name'
//             }
//         });

//     res.status(201).json({
//         student: populatedStudent
//     });
// });
const registerStudent = asyncHandler(async (req, res) => {
  const {
    name,
    fatherName,
    boardingNumber,
    email,
    password,
    contact,
    parentContact,
    roomNumber,
    hostelName,
    organizationName, // ✅ Added (new schema field)
    occupation,
    occupationOther,
    fee, // ✅ Added (new schema field)
    discount,
  } = req.body;

  // Validate required fields (removed program, department, year)
  if (
    !name ||
    !fatherName ||
    !boardingNumber ||
    !password ||
    !contact ||
    !parentContact
  ) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  // Check if student already exists
  const userExists = await User.findOne({ boardingNumber });
  if (userExists) {
    // console.log('❌ Duplicate boardingNumber:', boardingNumber);
    res.status(400);
    throw new Error("Student with this college number already exists");
  }

  let roomId = null;
  if (roomNumber && hostelName) {
    // console.log('🏨 Looking up hostel and room:', { hostelName, roomNumber });

    const hostel = await Hostel.findOne({ name: hostelName });
    if (!hostel) {
      // console.log('❌ Hostel not found:', hostelName);
      res.status(400);
      throw new Error("Hostel not found");
    }
    // console.log('✅ Hostel found:', hostel._id);

    const room = await Room.findOne({ roomNumber, hostel: hostel._id });
    if (!room) {
      // console.log('❌ Room not found:', { roomNumber, hostelId: hostel._id });
      res.status(400);
      throw new Error("Room not found in this hostel");
    }
    // console.log('✅ Room found:', room._id, '| Occupancy:', room.currentOccupants, '/', room.capacity);

    if (room.currentOccupants >= room.capacity) {
      console.log("❌ Room is full:", room._id);
      res.status(400);
      throw new Error("Room is already full");
    }

    roomId = room._id;
    room.currentOccupants += 1;
    if (room.currentOccupants >= room.capacity) {
      room.status = "Full";
    }
    await room.save();
    // console.log('✅ Room occupancy updated:', room.currentOccupants, '/', room.capacity);
  }

  // Create User
  // console.log('👤 Creating user account for:', boardingNumber);
  const user = await User.create({
    name,
    boardingNumber,
    email: email && email.trim() !== "" ? email : undefined,
    password,
    isAdmin: false,
    role: "student",
  });

  if (!user) {
    // console.log('❌ Failed to create user');
    res.status(400);
    throw new Error("Error creating student user account");
  }
  // console.log('✅ User created:', user._id);

  // Create Student profile (aligned with schema)
  // console.log('🎓 Creating student profile for user:', user._id);
  const student = await Student.create({
    user: user._id,
    boardingNumber,
    fatherName,
    contact,
    parentContact,
    organizationName: organizationName || undefined, // ✅ new field
    occupation: occupation || undefined,
    occupationOther: occupationOther,
    fee: fee || undefined, // ✅ new field
    discount: discount !== undefined ? Number(discount) : 0,
    room: roomId,
    hostel: roomId ? await Room.findById(roomId).then((r) => r?.hostel) : null,
    password,
    // ❌ Removed: program, department, year
  });

  // console.log('✅ Student profile created:', student._id);

  // Add student to room occupants list
  if (roomId) {
    const room = await Room.findById(roomId);
    if (room) {
      room.occupants.push(student._id);
      await room.save();
      // console.log('✅ Student added to room occupants:', roomId);
    }
  }

  const populatedStudent = await Student.findById(student._id)
    .populate("user", "name email boardingNumber")
    .populate({
      path: "room",
      select: "roomNumber boardingFee",
      populate: {
        path: "hostel",
        select: "name",
      },
    });

  // console.log('🎉 Student registration complete:', {
  //     studentId: student._id,
  //     boardingNumber,
  //     roomAssigned: !!roomId
  // });

  res.status(201).json({
    student: populatedStudent,
  });
});
// @desc    Get current student profile
// @route   GET /api/students/me
// @access  Private
const getMyProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user.id })
    .populate("user", "name email")
    .populate({
      path: "room",
      select: "roomNumber boardingFee",
      populate: {
        path: "hostel",
        select: "name",
      },
    });

  if (!student) {
    res.status(404);
    throw new Error("Student profile not found");
  }

  res.status(200).json(student);
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
// const updateStudent = asyncHandler(async (req, res) => {
//     const student = await Student.findById(req.params.id);

//     if (!student) {
//         res.status(404);
//         throw new Error('Student not found');
//     }

//     const { name, fatherName, boardingNumber, email, password, program, department, contact, parentContact, roomNumber, hostelName, year, room: newRoomId } = req.body;
//     console.log('Update Request Body:', JSON.stringify(req.body, null, 2));

//     // Update User if name, boardingNumber, email or password changed
//     const user = await User.findById(student.user);
//     if (user) {
//         if (name) user.name = name;
//         if (boardingNumber) user.boardingNumber = boardingNumber;
//         if (email !== undefined) {
//             user.email = email && email.trim() !== '' ? email : undefined;
//         }
//         if (password && password.trim() !== '') {
//             user.password = password; // The user model's pre-save hook will hash this
//         }
//         await user.save();
//     }

//     student.boardingNumber = boardingNumber || student.boardingNumber;
//     student.fatherName = fatherName || student.fatherName;
//     student.program = program || student.program;
//     student.department = department || student.department;
//     student.contact = contact || student.contact;
//     student.parentContact = parentContact || student.parentContact;
//     student.year = year || student.year;

//     if (password && password.trim() !== '') {
//         student.password = password;
//     }

//     console.log('Student document after field updates:', JSON.stringify(student, null, 2));

//     if (roomNumber && hostelName) {
//         const hostel = await Hostel.findOne({ name: hostelName });
//         if (hostel) {
//             const room = await Room.findOne({ roomNumber, hostel: hostel._id });
//             if (room && room._id.toString() !== (student.room?.toString() || '')) {
//                 // Remove from old room if exists
//                 if (student.room) {
//                     const oldRoom = await Room.findById(student.room);
//                     if (oldRoom) {
//                         oldRoom.currentOccupants = Math.max(0, oldRoom.currentOccupants - 1);
//                         oldRoom.occupants = oldRoom.occupants.filter(occId => occId.toString() !== student._id.toString());
//                         if (oldRoom.currentOccupants < oldRoom.capacity) {
//                             oldRoom.status = 'Available';
//                         }
//                         await oldRoom.save();
//                     }
//                 }

//                 // Add to new room
//                 student.room = room._id;
//                 student.hostel = hostel._id;
//                 room.currentOccupants += 1;
//                 room.occupants.push(student._id);
//                 if (room.currentOccupants >= room.capacity) {
//                     room.status = 'Full';
//                 }
//                 await room.save();
//             }
//         }
//     } else if (newRoomId !== undefined) {
//         // Direct room assignment (e.g. from Hostels page) or unassignment (null)
//         if (newRoomId === null) {
//             // Unassign: remove student from their current room
//             const currentRoomId = student.room;
//             if (currentRoomId) {
//                 // Use $pull to remove; then re-sync the counter from actual array length
//                 await Room.updateOne({ _id: currentRoomId }, { $pull: { occupants: student._id } });
//                 const roomAfterPull = await Room.findById(currentRoomId);
//                 if (roomAfterPull) {
//                     const newCount = roomAfterPull.occupants.length;
//                     await Room.updateOne(
//                         { _id: currentRoomId },
//                         {
//                             $set: {
//                                 currentOccupants: newCount,
//                                 status: newCount < roomAfterPull.capacity ? 'Available' : 'Full',
//                             }
//                         }
//                     );
//                 }
//             }
//             student.room = null;
//             student.hostel = null;
//         } else {
//             // Assign to a new room
//             const newRoomIdStr = newRoomId.toString();
//             const currentRoomIdStr = student.room ? student.room.toString() : '';

//             // Guard: if student already has a different room, reject
//             if (currentRoomIdStr && currentRoomIdStr !== newRoomIdStr) {
//                 res.status(400);
//                 throw new Error('Student is already assigned to a room. Please unassign them first before assigning a new room.');
//             }

//             // Only proceed if not already in this room
//             if (currentRoomIdStr !== newRoomIdStr) {
//                 const room = await Room.findById(newRoomId);
//                 if (!room) {
//                     res.status(404);
//                     throw new Error('Room not found');
//                 }

//                 // Use actual occupants.length as truth (not potentially drifted currentOccupants)
//                 const actualOccupants = room.occupants.length;
//                 if (actualOccupants >= room.capacity) {
//                     res.status(400);
//                     throw new Error(`Room is already at full capacity (${actualOccupants}/${room.capacity})`);
//                 }

//                 // Add student using $addToSet to avoid duplicates
//                 await Room.updateOne({ _id: room._id }, { $addToSet: { occupants: student._id } });

//                 // Re-read and sync the counter from the real array
//                 const roomAfterAdd = await Room.findById(room._id);
//                 if (roomAfterAdd) {
//                     const newCount = roomAfterAdd.occupants.length;
//                     await Room.updateOne(
//                         { _id: room._id },
//                         {
//                             $set: {
//                                 currentOccupants: newCount,
//                                 status: newCount >= roomAfterAdd.capacity ? 'Full' : 'Available',
//                             }
//                         }
//                     );
//                 }

//                 student.room = room._id;
//                 student.hostel = room.hostel;
//             }
//         }
//     }

//     const updatedStudent = await student.save({ validateModifiedOnly: true });

//     // Populate for response
//     const populatedStudent = await Student.findById(updatedStudent._id)
//         .populate('user', 'name email boardingNumber')
//         .populate({
//             path: 'room',
//             select: 'roomNumber',
//             populate: {
//                 path: 'hostel',
//                 select: 'name'
//             }
//         });

//     res.status(200).json(populatedStudent);
// });

const updateStudent = asyncHandler(async (req, res) => {
  // console.log('📥 Update student request - ID:', req.params.id);

  const student = await Student.findById(req.params.id);
  if (!student) {
    console.log("❌ Student not found:", req.params.id);
    res.status(404);
    throw new Error("Student not found");
  }

  const {
    name,
    fatherName,
    boardingNumber,
    email,
    password,
    contact,
    parentContact,
    roomNumber,
    hostelName,
    organizationName, // ✅ Added
    occupation, // ✅ Added
    occupationOther,
    fee, // ✅ Added
    discount,
    room: newRoomId,
    // ❌ Removed: program, department, year
  } = req.body;

  // Only super admin can change decided fee and discount once admission is made
  if (req.user.role !== "superadmin") {
    const feeChanged = fee !== undefined && Number(fee) !== student.fee;
    const discountChanged = discount !== undefined && Number(discount) !== student.discount;
    if (feeChanged || discountChanged) {
      res.status(403);
      throw new Error("Only the super admin is allowed to make changes for the decided fee and discounts");
    }
  }

  // console.log('📋 Update Request Body:', JSON.stringify({
  //     name, fatherName, boardingNumber, email,
  //     contact, parentContact, organizationName,
  //     occupation, fee, roomNumber, hostelName,
  //     newRoomId,
  //     password: password ? '***provided***' : undefined
  // }, null, 2));

  // ── Update User fields ──────────────────────────────────────
  const user = await User.findById(student.user);
  if (user) {
    console.log("👤 Updating user account:", user._id);
    if (name) user.name = name;
    if (boardingNumber) user.boardingNumber = boardingNumber;
    if (email !== undefined) {
      user.email = email && email.trim() !== "" ? email : undefined;
    }
    if (password && password.trim() !== "") {
      user.password = password; // pre-save hook will hash
    }
    await user.save();
    console.log("✅ User account updated");
  }

  // ── Update Student fields ───────────────────────────────────
  student.boardingNumber = boardingNumber || student.boardingNumber;
  student.fatherName = fatherName || student.fatherName;
  student.contact = contact || student.contact;
  student.parentContact = parentContact || student.parentContact;
  student.organizationName =
    organizationName !== undefined
      ? organizationName
      : student.organizationName; // ✅
  student.occupation =
    occupation !== undefined ? occupation : student.occupation; // ✅
  student.occupationOther =
    occupationOther !== undefined ? occupationOther : student.occupationOther; // ✅
  student.fee = fee !== undefined ? fee : student.fee; // ✅
  student.discount = discount !== undefined ? Number(discount) : student.discount; // ✅

  // ❌ Removed: student.program, student.department, student.year

  if (password && password.trim() !== "") {
    student.password = password;
  }

  // console.log('📝 Student fields after update:', JSON.stringify({
  //     boardingNumber: student.boardingNumber,
  //     fatherName: student.fatherName,
  //     contact: student.contact,
  //     parentContact: student.parentContact,
  //     organizationName: student.organizationName,
  //     occupation: student.occupation,
  //     fee: student.fee,
  // }, null, 2));

  // ── Room assignment via roomNumber + hostelName ─────────────
  if (roomNumber && hostelName) {
    console.log("🏨 Room update via hostelName+roomNumber:", {
      hostelName,
      roomNumber,
    });

    const hostel = await Hostel.findOne({ name: hostelName });
    if (hostel) {
      const room = await Room.findOne({ roomNumber, hostel: hostel._id });
      if (room && room._id.toString() !== (student.room?.toString() || "")) {
        // Remove from old room
        if (student.room) {
          console.log("🔄 Removing from old room:", student.room);
          const oldRoom = await Room.findById(student.room);
          if (oldRoom) {
            oldRoom.currentOccupants = Math.max(
              0,
              oldRoom.currentOccupants - 1,
            );
            oldRoom.occupants = oldRoom.occupants.filter(
              (occId) => occId.toString() !== student._id.toString(),
            );
            if (oldRoom.currentOccupants < oldRoom.capacity) {
              oldRoom.status = "Available";
            }
            await oldRoom.save();
            console.log(
              "✅ Old room updated - occupants now:",
              oldRoom.currentOccupants,
            );
          }
        }

        // Add to new room
        console.log("➕ Adding to new room:", room._id);
        student.room = room._id;
        student.hostel = hostel._id;
        room.currentOccupants += 1;
        room.occupants.push(student._id);
        if (room.currentOccupants >= room.capacity) {
          room.status = "Full";
        }
        await room.save();
        console.log(
          "✅ New room updated - occupants now:",
          room.currentOccupants,
        );
      }
    } else {
      console.log("⚠️ Hostel not found for room update:", hostelName);
    }

    // ── Room assignment via direct room ID ──────────────────────
  } else if (newRoomId !== undefined) {
    console.log("🏨 Room update via direct ID:", newRoomId);

    if (newRoomId === null) {
      // Unassign student from current room
      const currentRoomId = student.room;
      if (currentRoomId) {
        console.log("🔄 Unassigning student from room:", currentRoomId);
        await Room.updateOne(
          { _id: currentRoomId },
          { $pull: { occupants: student._id } },
        );

        const roomAfterPull = await Room.findById(currentRoomId);
        if (roomAfterPull) {
          const newCount = roomAfterPull.occupants.length;
          await Room.updateOne(
            { _id: currentRoomId },
            {
              $set: {
                currentOccupants: newCount,
                status:
                  newCount < roomAfterPull.capacity ? "Available" : "Full",
              },
            },
          );
          console.log("✅ Room unassigned - occupants now:", newCount);
        }
      }
      student.room = null;
      student.hostel = null;
      console.log("✅ Student unassigned from room and hostel");
    } else {
      // Assign to a new room
      const newRoomIdStr = newRoomId.toString();
      const currentRoomIdStr = student.room ? student.room.toString() : "";

      if (currentRoomIdStr && currentRoomIdStr !== newRoomIdStr) {
        console.log(
          "❌ Student already in a different room:",
          currentRoomIdStr,
        );
        res.status(400);
        throw new Error(
          "Student is already assigned to a room. Please unassign them first before assigning a new room.",
        );
      }

      if (currentRoomIdStr !== newRoomIdStr) {
        console.log("➕ Assigning student to room:", newRoomId);
        const room = await Room.findById(newRoomId);
        if (!room) {
          console.log("❌ Room not found:", newRoomId);
          res.status(404);
          throw new Error("Room not found");
        }

        const actualOccupants = room.occupants.length;
        if (actualOccupants >= room.capacity) {
          console.log("❌ Room full:", actualOccupants, "/", room.capacity);
          res.status(400);
          throw new Error(
            `Room is already at full capacity (${actualOccupants}/${room.capacity})`,
          );
        }

        await Room.updateOne(
          { _id: room._id },
          { $addToSet: { occupants: student._id } },
        );

        const roomAfterAdd = await Room.findById(room._id);
        if (roomAfterAdd) {
          const newCount = roomAfterAdd.occupants.length;
          await Room.updateOne(
            { _id: room._id },
            {
              $set: {
                currentOccupants: newCount,
                status:
                  newCount >= roomAfterAdd.capacity ? "Full" : "Available",
              },
            },
          );
          console.log("✅ Room assigned - occupants now:", newCount);
        }

        student.room = room._id;
        student.hostel = room.hostel;
      } else {
        console.log("ℹ️ Student already in requested room, no change needed");
      }
    }
  }

  // ── Save & respond ──────────────────────────────────────────
  const updatedStudent = await student.save({ validateModifiedOnly: true });
  // console.log('💾 Student saved:', updatedStudent._id);

  const populatedStudent = await Student.findById(updatedStudent._id)
    .populate("user", "name email boardingNumber")
    .populate({
      path: "room",
      select: "roomNumber boardingFee",
      populate: {
        path: "hostel",
        select: "name",
      },
    });

  // console.log('🎉 Student update complete:', updatedStudent._id);
  res.status(200).json(populatedStudent);
});
// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  // Delete associated User
  await User.findByIdAndDelete(student.user);

  // Remove student from room occupants if assigned
  if (student.room) {
    const room = await Room.findById(student.room);
    if (room) {
      room.currentOccupants = Math.max(0, room.currentOccupants - 1);
      room.occupants = room.occupants.filter(
        (occId) => occId.toString() !== student._id.toString(),
      );
      if (room.currentOccupants < room.capacity) {
        room.status = "Available";
      }
      await room.save();
    }
  }

  await student.deleteOne();

  res.status(200).json({ message: "Student removed" });
});

module.exports = {
  getStudents,
  registerStudent,
  getMyProfile,
  updateStudent,
  deleteStudent,
};
