import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { getAuth } from '@clerk/nextjs/server'

const DATA_FILE = path.join(process.cwd(), 'data', 'actionPlans.json')

// Helper function to read the JSON file
const readActionPlans = (): Record<string, any> => {
  if (!fs.existsSync(DATA_FILE)) {
    return {}
  }
  const fileContents = fs.readFileSync(DATA_FILE, 'utf8')
  return JSON.parse(fileContents)
}

// Helper function to write to the JSON file
const writeActionPlans = (data: Record<string, any>) => {
  const dirPath = path.dirname(DATA_FILE)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    const actionPlans = readActionPlans()
    const userPlan = actionPlans[userId] || null
    res.status(200).json(userPlan)
  } else if (req.method === 'POST') {
    const actionPlans = readActionPlans()
    actionPlans[userId] = req.body
    writeActionPlans(actionPlans)
    res.status(200).json({ message: 'Action plan saved successfully' })
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}