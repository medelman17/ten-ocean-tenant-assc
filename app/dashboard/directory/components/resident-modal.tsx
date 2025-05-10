"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Icons } from "@/components/ui/icons"
import { ResidentProfile } from "@/lib/types/directory"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ResidentModalProps {
  resident: ResidentProfile
  isOpen: boolean
  onClose: () => void
}

export function ResidentModal({ resident, isOpen, onClose }: ResidentModalProps) {
  const defaultAvatar = `https://avatar.vercel.sh/${resident.id}?size=128`
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Resident Profile</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-28 w-28">
              <AvatarImage 
                src={resident.profilePictureUrl || defaultAvatar} 
                alt={resident.displayName || `${resident.firstName} ${resident.lastName}`} 
              />
              <AvatarFallback>
                {resident.firstName?.[0]}{resident.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex gap-2 flex-wrap justify-center">
              <Badge variant="outline">{resident.unit?.unitNumber || "No Unit"}</Badge>
              {resident.moveInDate && (
                <Badge variant="secondary">
                  Resident since {format(new Date(resident.moveInDate), 'MMM yyyy')}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              {resident.displayName || `${resident.firstName} ${resident.lastName}`}
            </h2>
            <p className="text-muted-foreground">{resident.occupation || ""}</p>
            
            <Separator className="my-4" />
            
            <div className="grid gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">About</h3>
                <p>{resident.bio || "No bio provided."}</p>
              </div>
              
              {resident.languagesSpoken && resident.languagesSpoken.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Languages</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {resident.languagesSpoken.map(language => (
                      <Badge key={language} variant="outline">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {resident.skills && resident.skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Skills & Interests</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {resident.skills.map(skill => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {resident.communityInvolvement && resident.communityInvolvement.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Community Involvement</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {resident.communityInvolvement.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {resident.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Icons.phone className="h-4 w-4 text-muted-foreground" />
                  <span>{resident.phone}</span>
                </div>
              )}
              
              {resident.socialMediaLinks && Object.keys(resident.socialMediaLinks).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(resident.socialMediaLinks).map(([platform, url]) => {
                    if (!url) return null
                    
                    const Icon = getIconForPlatform(platform)
                    return (
                      <Button 
                        key={platform} 
                        variant="outline" 
                        size="sm" 
                        asChild
                        className="h-8"
                      >
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          {Icon && <Icon className="h-4 w-4 mr-2" />}
                          {platform}
                        </a>
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getIconForPlatform(platform: string) {
  const loweredPlatform = platform.toLowerCase()
  
  if (loweredPlatform.includes('linkedin')) return Icons.linkedin
  if (loweredPlatform.includes('twitter') || loweredPlatform.includes('x')) return Icons.twitter
  if (loweredPlatform.includes('instagram')) return Icons.instagram
  if (loweredPlatform.includes('facebook')) return Icons.facebook
  if (loweredPlatform.includes('github')) return Icons.github
  
  return Icons.link
}