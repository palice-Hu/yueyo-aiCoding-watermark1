import exifr from 'exifr'

/**
 * 从图片文件中读取EXIF信息并提取拍摄时间
 * @param file 图片文件
 * @returns 拍摄时间字符串或null
 */
export async function getPhotoTakenTime(file: File): Promise<string | null> {
  try {
    // 读取EXIF信息
    const exifData = await exifr.parse(file)
    
    if (!exifData) {
      return null
    }
    
    // 尝试获取拍摄时间
    let dateTime: Date | undefined
    
    if (exifData.DateTimeOriginal) {
      dateTime = new Date(exifData.DateTimeOriginal)
    } else if (exifData.DateTime) {
      dateTime = new Date(exifData.DateTime)
    } else if (exifData.GPSDateStamp && exifData.GPSTimeStamp) {
      // 处理GPS时间戳
      const [hours, minutes, seconds] = exifData.GPSTimeStamp
      const date = new Date(exifData.GPSDateStamp)
      date.setUTCHours(hours)
      date.setUTCMinutes(minutes)
      date.setUTCSeconds(seconds)
      dateTime = date
    }
    
    if (dateTime && !isNaN(dateTime.getTime())) {
      // 格式化为年月日格式
      return formatDate(dateTime)
    }
    
    return null
  } catch (error) {
    console.error('读取EXIF信息失败:', error)
    return null
  }
}

/**
 * 格式化日期为年月日格式
 * @param date 日期对象
 * @returns 格式化后的日期字符串
 */
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

/**
 * 获取文件名（不含扩展名）
 * @param fileName 文件名
 * @returns 不含扩展名的文件名
 */
export function getFileNameWithoutExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.')
  return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName
}