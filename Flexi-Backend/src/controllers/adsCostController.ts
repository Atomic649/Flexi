import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import multer from "multer";

const upload: multer.Multer = multer();

// Create  instance of PrismaClient
const prisma = new PrismaClient();

// Interface for request body from client
interface adsCostInput {
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
  date: Date;
  memberId: string;
  adsCost: number;
  platformId: number;
  businessAcc: number;
  platform?: JSON;
  product: string;
   // Add the 'product' property
}


// Create many ads cost - Post by Form Data
const createManyAdsCosts = async (req: Request, res: Response) => {
  {
    upload.single("file")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      const jsonBody = req.body as Prisma.AdsCostCreateManyInput[];
      const adsCostInput: adsCostInput[] = jsonBody as adsCostInput[];
      //console.log("Request Body:", adsCostInput);

      // Don't have to Validate the request body because covert type anyway
      // Convert Form data to Type that is valid with Prisma
      adsCostInput.forEach((item) => {
        item.memberId = String(item.memberId);
        item.adsCost = Number(item.adsCost);
        item.platformId = Number(item.platformId);
        item.businessAcc = Number(item.businessAcc);
        item.date = new Date(item.date);
      });
      //console.log("Request Body:", adsCostInput);
      // log error type
      console.log("Error Type:", typeof adsCostInput[0].date);

      // Further processing with Prisma
      try {
        const adsCost = await prisma.adsCost.createMany({
          data: adsCostInput,
        });
        res.json({
          status: "ok",
          message: "ads cost created successfully",
          ads: adsCost,
        });
      } catch (e) {
        console.error(e);
        res.status(500).json({ message: "failed to create ads cost" });
      }
    });
  }
};
// Upload a ads cost - Post by Form Data
const createAdsCost = async (req: Request, res: Response) => {
  {
    upload.single("file")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      const jsonBody = req.body as Prisma.AdsCostCreateInput;
      const adsCostInput: adsCostInput = jsonBody as unknown as adsCostInput;
      //console.log("Request Body:", adsCostInput);

      // Convert Form data to Type that is valid with Prisma
      adsCostInput.memberId = String(adsCostInput.memberId);
      adsCostInput.adsCost = Number(adsCostInput.adsCost);
      adsCostInput.platformId = Number(adsCostInput.platformId);
      adsCostInput.businessAcc = Number(adsCostInput.businessAcc);
      adsCostInput.date = new Date(adsCostInput.date);


      // Further processing with Prisma
      try {
        const adsCost = await prisma.adsCost.create({
          data: {
            date: adsCostInput.date,
            adsCost: adsCostInput.adsCost,
            memberId: adsCostInput.memberId,
            businessAcc: adsCostInput.businessAcc,
            platformId: adsCostInput.platformId,
            product: adsCostInput.product, // Add the 'product' property
            
          },
        });
        res.json({
          status: "ok",
          message: "ads cost created successfully",
          ads: {
            id: adsCost.id,
            date: adsCost.date,
            adsCost: adsCost.adsCost,
            memberId: adsCost.memberId,
            businessAcc: adsCost.businessAcc,
            platformId: adsCost.platformId,
          },
        });
      } catch (e) {
        console.error(e);
        res.status(500).json({ message: "failed to create ads cost" });
      }
    });
  }
};
// Get all ads costs - Get
const getAdsCosts = async (req: Request, res: Response) => {
  const { businessAcc } = req.params;
  try {
    const adsCosts = await prisma.adsCost.findMany({
      orderBy: {
        date: "desc",
      },
      where: {
        businessAcc: Number(businessAcc),
      },
      include: {
        platform: true,
      },
    });
    res.json(adsCosts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get ads costs" });
  }
}

// Get all ads costs By date and platform - Get
const getAdsCostsByDate = async (req: Request, res: Response) => {
  const { businessAcc } = req.params;
  const { product } = req.query;

  const productFilter: Prisma.AdsCostWhereInput = product
    ? { product: { equals: String(product) } }
    : {};

  try {
        // sum ads cost by date
    const Sum = await prisma.adsCost.groupBy({
      by: ["date", "platformId"],
      where: {
        businessAcc: Number(businessAcc),
        ...productFilter,
      },
      _sum: {
        adsCost: true,
      },
    });
   // console.log(Date, Sum);
    // convert Date to DateWithoutTime
    const DateWithoutTime = Sum.map((item) => {
      return {
        date: item.date.toISOString().split("T")[0],
        adsCost: item._sum.adsCost,
        platformId: item.platformId,
      };
    });
    //console.log('DateWithoutTime:', DateWithoutTime);
    // find platform by platformId
    const platform = await prisma.platform.findMany({
      select: { id: true, platform: true },
    });
   // console.log('platform',platform);

    // map platformId to platform
    // sum ads cost if date and platform are duplicated
    const adsCostByDateAndPlatform: { [date: string]: { [platform: string]: number } } = {};
    DateWithoutTime.forEach((item) => {
      const key = item.date;
      const platformId = item.platformId;
      if (adsCostByDateAndPlatform[key]) {
      if (adsCostByDateAndPlatform[key][platformId]) {
        adsCostByDateAndPlatform[key][platformId] += Number(item.adsCost) || 0;
      } else {
        adsCostByDateAndPlatform[key][platformId] = item.adsCost?.toNumber() ?? 0;
      }
      } else {
      adsCostByDateAndPlatform[key] = { [platformId]: Number(item.adsCost) ?? 0 };
      }
    });

    const platformName = DateWithoutTime.map((item) => {
      const platformName = platform.find(
      (platform) => platform.id === item.platformId
      );
      return {
      date: item.date,
      adsCost: adsCostByDateAndPlatform[item.date][item.platformId],
      platform: platformName?.platform,
      };
    });
    // console.log('platformName',platformName);

    // filter out if (date and platform) are duplicated
    const adsCost = platformName.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) => t.date === item.date && t.platform === item.platform
        )
    );
    // console.log('adsCost',adsCost);
    

    res.json(
     adsCost,
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get ads costs" });
  }
};

//--- Get a ads cost by platformId - Get
const getAdsCostById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const adsCost = await prisma.adsCost.findUnique({
      include: {
        platform: true,
      },
      where: {
        id: Number(id),
      },
    });
    res.json(adsCost);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get ads cost" });
  }
};

//----Search a ads cost by date - Get
const SearchAdsCostByDate = async (req: Request, res: Response) => {
  const { date } = req.params;
  try {
    const adsCost = await prisma.adsCost.findMany({
      where: {
        date: date,
      },
    });
    res.json(adsCost);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to get ads cost" });
  }
};

// Update a date by id - Put
const updateAdsDateById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const adsCostInput: adsCostInput = req.body;
  try {
    const adsCost = await prisma.adsCost.update({
      where: {
        id: Number(id),
      },
      data: {
        date: adsCostInput.date,
      },
    });
    res.json(adsCost);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to update ads cost" });
  }
};
//--- Update a ads cost by platformId - Put
const updateAdsCost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const adsCostInput: adsCostInput = req.body;
  try {
    const adsCost = await prisma.adsCost.update({
      where: {
        id: Number(id),
      },
      data: {
        adsCost: adsCostInput.adsCost,
      },
    });
    res.json(adsCost);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to update ads cost" });
  }
};

// Delete a ads cost by platformId - Delete
const deleteAdsCost = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const adsCost = await prisma.adsCost.delete({
      where: {
        id: Number(id),
      },
    });
    res.json(adsCost);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "failed to delete ads cost" });
  }
};
export {
  createManyAdsCosts,
  createAdsCost,
  getAdsCosts,
  getAdsCostsByDate,
  getAdsCostById,
  SearchAdsCostByDate,
  updateAdsCost,
  deleteAdsCost,
  updateAdsDateById,
};
